'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface TaskData {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  teamId: string;
  teamName: string;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
  startDate: Date;
  endDate: Date;
  estimatedDays?: number;
  notes?: string;
  isMilestone: boolean;
}

interface Group {
  name: string;
  color: string;
  tasks: TaskData[];
}

interface DraggableGanttChartProps {
  /** A 2-D array of weeks (each week 7 dates) OR a flat list of dates. */
  weeks: Date[][];
  groupedTasks: Record<string, Group>;
  onTaskClick: (task: TaskData) => void;
  onTaskReschedule: (taskId: string, newStart: Date, newEnd: Date) => void;
  /** "project" (default) or "team" – chooses which body to render. */
  groupBy?: 'project' | 'team';
}

const DAY_W = 30;
const LABEL_W = 320;

const BAR_HEIGHT = 24;
const BAR_GAP = 10;
const ROW_PAD_Y = 12;
const MIN_TEAM_ROW_H = 68;

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtDate(date: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return date.getDate() + ' ' + months[date.getMonth()];
}
function fmtDateLong(date: Date) {
  return fmtDate(date) + ' ' + date.getFullYear();
}
function dayIndexOf(date: Date, dates: Date[]): number {
  for (let i = 0; i < dates.length; i++) {
    if (sameDay(dates[i], date)) return i;
  }
  const t = date.getTime();
  if (t < dates[0].getTime()) return -1;
  if (t > dates[dates.length - 1].getTime()) return dates.length;
  return 0;
}

interface ProjectGroup extends Group {
  id: string;
  start: number; // day index
  end: number; // day index
  clippedLeft: boolean;
  clippedRight: boolean;
}

interface TeamLaneTask {
  task: TaskData;
  start: number;
  end: number;
  lane: number;
  hasConflict: boolean;
  clippedLeft: boolean;
  clippedRight: boolean;
}

interface TeamGroup {
  name: string;
  tasks: TeamLaneTask[];
  conflictCount: number;
  lanes: number;
}

/** Convert weeks[][] (or flat list) into a 1-D ordered date array. */
function flattenDates(weeks: Date[][] | Date[]): Date[] {
  if (Array.isArray(weeks) && weeks.length > 0 && Array.isArray((weeks as any)[0])) {
    return (weeks as Date[][]).flat();
  }
  return (weeks as Date[]).slice();
}

export function DraggableGanttChart({
  weeks,
  groupedTasks,
  onTaskClick,
  onTaskReschedule,
  groupBy = 'project',
}: DraggableGanttChartProps) {
  const dates = useMemo(() => flattenDates(weeks), [weeks]);
  const totalDays = dates.length;
  const totalWeeks = Math.ceil(totalDays / 7);
  
  const today = new Date();
  const todayIdx = useMemo(() => {
    for (let i = 0; i < dates.length; i++) if (sameDay(dates[i], today)) return i;
    return -1;
  }, [dates]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(groupedTasks).forEach((k, i) => (init[k] = i < 2));
    return init;
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const projectBodyRef = useRef<HTMLDivElement>(null);
  const teamBodyRef = useRef<HTMLDivElement>(null);
  const todayLineRef = useRef<HTMLDivElement>(null);

  // ===== Build project groups with clamped day indices =====
  const projectGroups: ProjectGroup[] = useMemo(() => {
    return Object.entries(groupedTasks).map(([id, g]) => {
      const tasks = g.tasks;
      if (tasks.length === 0) {
        return { id, ...g, start: 0, end: 0, clippedLeft: false, clippedRight: false };
      }
      let min = tasks[0].startDate;
      let max = tasks[0].endDate;
      for (const t of tasks) {
        if (t.startDate < min) min = t.startDate;
        if (t.endDate > max) max = t.endDate;
      }
      const rawStart = dayIndexOf(min, dates);
      const rawEnd = dayIndexOf(max, dates);
      const clippedLeft = rawStart < 0;
      const clippedRight = rawEnd >= totalDays;
      const start = Math.max(0, rawStart);
      const end = Math.min(totalDays - 1, rawEnd < 0 ? 0 : rawEnd);
      return { id, ...g, start, end, clippedLeft, clippedRight };
    });
  }, [groupedTasks, dates, totalDays]);

  // ===== Conflict detection (overlapping tasks per team) =====
  const conflictTaskIds = useMemo(() => {
    const ids = new Set<string>();
    const byTeam = new Map<string, TaskData[]>();
    Object.values(groupedTasks).forEach((g) =>
      g.tasks.forEach((t) => {
        const key = t.teamId || t.teamName;
        if (!byTeam.has(key)) byTeam.set(key, []);
        byTeam.get(key)!.push(t);
      })
    );
    byTeam.forEach((arr) => {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].startDate <= arr[j].endDate && arr[j].startDate <= arr[i].endDate) {
            ids.add(arr[i].id);
            ids.add(arr[j].id);
          }
        }
      }
    });
    return ids;
  }, [groupedTasks]);

  // ===== Build team groups (lanes) =====
  const teamGroups: TeamGroup[] = useMemo(() => {
    const map = new Map<string, TeamGroup>();
    Object.values(groupedTasks).forEach((g) =>
      g.tasks.forEach((t) => {
        const teamKey = t.teamName || t.teamId;
        if (!map.has(teamKey)) map.set(teamKey, { name: teamKey, tasks: [], conflictCount: 0, lanes: 1 });
        const rawStart = dayIndexOf(t.startDate, dates);
        const rawEnd = dayIndexOf(t.endDate, dates);
        map.get(teamKey)!.tasks.push({
          task: t,
          start: Math.max(0, rawStart),
          end: Math.min(totalDays - 1, rawEnd < 0 ? 0 : rawEnd),
          lane: 0,
          hasConflict: conflictTaskIds.has(t.id),
          clippedLeft: rawStart < 0,
          clippedRight: rawEnd >= totalDays,
        });
      })
    );

    const teams = Array.from(map.values());
    teams.forEach((team) => {
      const sorted = team.tasks
        .map((t, i) => ({ t, i }))
        .sort((a, b) => a.t.start - b.t.start);
      const laneEnds: number[] = [];
      sorted.forEach(({ t, i }) => {
        let placed = false;
        for (let l = 0; l < laneEnds.length; l++) {
          if (laneEnds[l] < t.start) {
            team.tasks[i].lane = l;
            laneEnds[l] = t.end;
            placed = true;
            break;
          }
        }
        if (!placed) {
          team.tasks[i].lane = laneEnds.length;
          laneEnds.push(t.end);
        }
      });
      team.lanes = Math.max(1, laneEnds.length);
      team.conflictCount = team.tasks.filter((t) => t.hasConflict).length;
    });
    teams.sort((a, b) => {
      if ((b.conflictCount > 0) !== (a.conflictCount > 0)) return b.conflictCount > 0 ? 1 : -1;
      if (b.conflictCount !== a.conflictCount) return b.conflictCount - a.conflictCount;
      if (b.tasks.length !== a.tasks.length) return b.tasks.length - a.tasks.length;
      return a.name.localeCompare(b.name);
    });
    return teams;
  }, [groupedTasks, dates, totalDays, conflictTaskIds]);

  // ===== Today line positioning =====
  useEffect(() => {
    const headerEl = headerRef.current;
    const todayEl = todayLineRef.current;
    if (!headerEl || !todayEl) return;
    const visibleBody = groupBy === 'project' ? projectBodyRef.current : teamBodyRef.current;
    if (!visibleBody) return;
    todayEl.style.height = visibleBody.offsetHeight + 'px';
    todayEl.style.top = headerEl.offsetHeight + 'px';
  }, [groupBy, expanded, dates, projectGroups, teamGroups]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (todayIdx >= 0) {
      wrap.scrollLeft = Math.max(0, todayIdx * DAY_W - 100);
    }
  }, [todayIdx]);

  // ===== Drag / resize state =====
  type DragMode = 'move' | 'resize-start' | 'resize-end';
  const dragRef = useRef<{
  taskId: string;
  mode: DragMode;
  startX: number;
  origStart: Date;
  origEnd: Date;
  initialLeft: number;
  initialWidth: number;
  top?: number;
} | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
  left: number;
  width: number;
  top?: number;
} | null>(null);

const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  
const handlePointerDown = (
  e: React.PointerEvent,
  task: TaskData,
  mode: DragMode,
  left: number,
  width: number,
  top?: number
) => {
  e.preventDefault();
  e.stopPropagation();

  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

  dragRef.current = {
    taskId: task.id,
    mode,
    startX: e.clientX,
    origStart: new Date(task.startDate),
    origEnd: new Date(task.endDate),
    initialLeft: left,
    initialWidth: width,
    top,
  };

  setDraggingId(task.id);

  setDragPreview({
    left,
    width,
    top,
  });
};

  useEffect(() => {
    if (!draggingId) return;
    const onMove = (e: PointerEvent) => {
  if (!dragRef.current) return;

  const {
    mode,
    startX,
    initialLeft,
    initialWidth,
    top,
  } = dragRef.current;

  const deltaDays = Math.round((e.clientX - startX) / DAY_W);

  let left = initialLeft;
  let width = initialWidth;

  if (mode === 'move') {
    left = initialLeft + deltaDays * DAY_W;
  }

  if (mode === 'resize-end') {
    width = Math.max(DAY_W, initialWidth + deltaDays * DAY_W);
  }

  if (mode === 'resize-start') {
    left = initialLeft + deltaDays * DAY_W;
    width = Math.max(DAY_W, initialWidth - deltaDays * DAY_W);
  }

  setDragPreview({
    left,
    width,
    top,
  });

  document.body.style.cursor = 'grabbing';
};
    const onUp = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { taskId, mode, startX, origStart, origEnd } = dragRef.current;
      const deltaDays = Math.round((e.clientX - startX) / DAY_W);
      let newStart = new Date(origStart);
      let newEnd = new Date(origEnd);
      if (mode === 'move') {
        newStart = addDays(origStart, deltaDays);
        newEnd = addDays(origEnd, deltaDays);
      } else if (mode === 'resize-end') {
        newEnd = addDays(origEnd, deltaDays);
        if (newEnd < newStart) newEnd = new Date(newStart);
      } else if (mode === 'resize-start') {
        newStart = addDays(origStart, deltaDays);
        if (newStart > newEnd) newStart = new Date(newEnd);
      }
      if (deltaDays !== 0) onTaskReschedule(taskId, newStart, newEnd);
      document.body.style.cursor = '';
      setDragPreview(null);
      dragRef.current = null;
      setDraggingId(null);
      
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId, onTaskReschedule]);

  const renderWeekendStripes = () =>
    dates.map((d, i) =>
      d.getDay() === 6 ? (
        <div key={`ws-${i}`} className="weekend-stripe" style={{ left: i * DAY_W + 'px' }} />
      ) : null
    );

  const progressPct = (s: number, e: number) => {
    if (todayIdx < 0) return 0;
    if (e < todayIdx) return 100;
    if (s > todayIdx) return 0;
    return Math.max(0, Math.min(100, ((todayIdx - s + 1) / (e - s + 1)) * 100));
  };

  const colorClass = (color: string) => {
    // Accept "p1".."p5" or numeric ids; normalize to .p-N
    const m = (color || '').match(/(\d+)/);
    const idx = m ? Math.min(5, Math.max(1, parseInt(m[1], 10))) : 1;
    return `p-${idx}`;
  };

  return (
    <div className="gantt-proto is-overview">
      <div className="gantt-wrap" ref={wrapRef}>
        <div className="gantt">
          {/* Header */}
          <div className="gantt-header" ref={headerRef}>
            <div className="header-label-cell">{groupBy === 'project' ? 'Project / Task' : 'Team'}</div>
            <div className="timeline-headers">
              <div className="week-row">
                {Array.from({ length: totalWeeks }, (_, w) => {
                  const weekStart = dates[w * 7] ?? addDays(dates[0], w * 7);
                  return (
                    <div
                      key={`wk-${w}`}
                      className="week-cell"
                      style={{ width: 7 * DAY_W + 'px', minWidth: 7 * DAY_W + 'px' }}
                    >
                      W/C {fmtDate(weekStart)}
                    </div>
                  );
                })}
              </div>
              <div className="day-row">
                {dates.map((d, i) => {
                  const dow = d.getDay();
                  const cls = [
                    'day-cell',
                    dow === 0 || dow === 6 ? 'weekend' : '',
                    i === todayIdx ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <div key={`d-${i}`} className={cls}>
                      <span className="dnum">{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* By Project body */}
          {groupBy === 'project' && (
            <div className="gantt-body" ref={projectBodyRef}>
              {projectGroups.map((proj) => {
                const isExpanded = expanded[proj.id] ?? false;
                const span = Math.max(1, proj.end - proj.start + 1);
                return (
                  <React.Fragment key={proj.id}>
                    <div
                      className={`row project-row ${colorClass(proj.color)}${isExpanded ? ' expanded' : ''}`}
                    >
                      <div
                        className="row-label"
                        onClick={() => setExpanded((s) => ({ ...s, [proj.id]: !isExpanded }))}
                        role="button"
                      >
                        <span className="chevron">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                        <span className="project-name">{proj.name}</span>
                        <span className="project-meta">{proj.tasks.length} tasks</span>
                      </div>
                      <div className="row-timeline" style={{ width: totalDays * DAY_W + 'px' }}>
                        
                        {renderWeekendStripes()}
                        <div
                          className={`bar bar-project${proj.clippedRight ? ' bar-clipped-right' : ''}`}
                          style={{ left: proj.start * DAY_W + 'px', width: span * DAY_W + 'px' }}
                          data-tooltip={`${proj.name} · ${proj.tasks.length} tasks`}
                        >
                          <div className="bar-progress" style={{ width: progressPct(proj.start, proj.end) + '%' }} />
                          <span className="bar-content">{proj.name} · {proj.tasks.length} tasks</span>
                        </div>
                      </div>
                    </div>
                    {proj.tasks.map((task) => {
                      const rs = dayIndexOf(task.startDate, dates);
                      const re = dayIndexOf(task.endDate, dates);
                      const clippedRight = re >= totalDays;
                      const s = Math.max(0, rs);
                      const e = Math.min(totalDays - 1, re < 0 ? 0 : re);
                      const w = Math.max(1, e - s + 1);
                      const isMilestone = task.isMilestone || task.status === 'milestone';
                      const hasConflict = conflictTaskIds.has(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`row task-row ${colorClass(proj.color)}${isExpanded ? '' : ' hidden'}`}
                        >
                          <div className="row-label">
                            <div className="task-label">
                              <span className="task-name">{task.name}</span>
                              <span className={`team-chip${hasConflict ? ' has-conflict' : ''}`}>
                                <span className="team-dot" />
                                {task.teamName}
                              </span>
                            </div>
                          </div>
                          <div className="row-timeline" style={{ width: totalDays * DAY_W + 'px' }}>
                           {dragPreview && draggingId === task.id && (
                            <div
                              className="drag-preview-bar"
                              style={{
                                left: dragPreview.left + 'px',
                                width: dragPreview.width + 'px',
                                top:
                                  dragPreview.top !== undefined
                                    ? dragPreview.top + 'px'
                                    : undefined,
                              }}
                            />
                          )}
                            {renderWeekendStripes()}
                            {isMilestone ? (
                              <button
                                type="button"
                                className="milestone"
                                style={{ left: s * DAY_W + DAY_W / 2 + 'px' }}
                                data-tooltip={`${task.name} · ${fmtDateLong(task.startDate)}`}
                                onClick={() => onTaskClick(task)}
                              />
                            ) : (
                              <div
                                className={`bar bar-task${clippedRight ? ' bar-clipped-right' : ''}${hasConflict ? ' has-conflict' : ''}`}
                                style={{ left: s * DAY_W + 'px', width: w * DAY_W + 'px' }}
                                data-tooltip={`${task.name} · ${task.teamName} · ${fmtDateLong(task.startDate)} → ${fmtDateLong(task.endDate)}${hasConflict ? ' · ⚠ conflict' : ''}`}
                                onPointerDown={(ev) =>
                                  handlePointerDown(
                                    ev,
                                    task,
                                    'move',
                                    s * DAY_W,
                                    w * DAY_W
                                  )
                                }
                                onClick={() => onTaskClick(task)}
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                              >
                                {hoveredTask === task.id && (
                                  <div className="task-hover-tooltip">
                                    Drag or Resize Task
                                  </div>
                                )}
                                <div
                                  className="bar-resize left"
                                  onPointerDown={(ev) =>
                                  handlePointerDown(
                                    ev,
                                    task,
                                    'resize-start',
                                    s * DAY_W,
                                    w * DAY_W
                                  )
                                }
                                />
                                <div className="bar-progress" style={{ width: progressPct(s, e) + '%' }} />
                                <span className="bar-content">{task.name}</span>
                                <div
                                  className="bar-resize right"
                                  onPointerDown={(ev) =>
                                  handlePointerDown(
                                    ev,
                                    task,
                                    'resize-end',
                                    s * DAY_W,
                                    w * DAY_W
                                  )
                                }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* By Team body */}
          {groupBy === 'team' && (
            <div className="gantt-body" ref={teamBodyRef}>
              {teamGroups.map((team) => {
                const laneBlockH = team.lanes * BAR_HEIGHT + (team.lanes - 1) * BAR_GAP;
                const rowHeight = Math.max(MIN_TEAM_ROW_H, laneBlockH + 2 * ROW_PAD_Y);
                const topOffset = (rowHeight - laneBlockH) / 2;
                return (
                  <div
                    key={team.name}
                    className={`row team-row${team.conflictCount > 0 ? ' has-conflict-row' : ''}`}
                    style={{ height: rowHeight + 'px' }}
                  >
                    <div className="row-label">
                      <div className="team-label-content">
                        <span className="team-name">{team.name}</span>
                        <div className="team-meta">
                          <span className="team-count-chip">
                            {team.tasks.length} task{team.tasks.length === 1 ? '' : 's'}
                          </span>
                          {team.conflictCount > 0 && (
                            <span className="team-conflict-chip">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              {team.conflictCount} conflict{team.conflictCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row-timeline" style={{ width: totalDays * DAY_W + 'px' }}>
                      {dragPreview && (
                            <div
                              className="drag-preview-bar"
                              style={{
                                left: dragPreview.left + 'px',
                                width: dragPreview.width + 'px',
                                top:
                                  dragPreview.top !== undefined
                                    ? dragPreview.top + 'px'
                                    : undefined,
                              }}
                            />
                          )}
                      {renderWeekendStripes()}
                      {team.tasks.map(({ task, start, end, lane, hasConflict, clippedRight }) => {
                        const w = Math.max(1, end - start + 1);
                        const topPos = topOffset + lane * (BAR_HEIGHT + BAR_GAP);
                        const isMilestone = task.isMilestone || task.status === 'milestone';
                        if (isMilestone) {
                          return (
                            <button
                              type="button"
                              key={task.id}
                              className="milestone"
                              style={{
                                left: start * DAY_W + DAY_W / 2 + 'px',
                                top: topOffset + lane * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT / 2 + 'px',
                              }}
                              data-tooltip={`${task.projectName} · ${task.name} · ${fmtDateLong(task.startDate)}`}
                              onClick={() => onTaskClick(task)}
                            />
                          );
                        }
                        return (
                          <div
                            key={task.id}
                            className={`bar bar-task ${colorClass(task.projectColor)}${clippedRight ? ' bar-clipped-right' : ''}${hasConflict ? ' has-conflict' : ''}`}
                            style={{
                              left: start * DAY_W + 'px',
                              width: w * DAY_W + 'px',
                              top: topOffset + lane * (BAR_HEIGHT + BAR_GAP) + 'px',
                              transform: 'none',
                            }}
                            data-tooltip={`${task.projectName} · ${task.name} · ${fmtDateLong(task.startDate)} → ${fmtDateLong(task.endDate)}${hasConflict ? ' · ⚠ conflict' : ''}`}
                            onPointerDown={(ev) =>
                            handlePointerDown(
                              ev,
                              task,
                              'move',
                              start * DAY_W,
                              w * DAY_W,
                              topPos
                            )
                          }
                            onClick={() => onTaskClick(task)}
                            onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                          >
                             {hoveredTask === task.id && (
                                  <div className="task-hover-tooltip">
                                    Drag or Resize Task
                                  </div>
                                )}
                            <div
                              className="bar-resize left"
                              onPointerDown={(ev) =>
                              handlePointerDown(
                                ev,
                                task,
                                'resize-start',
                                start * DAY_W,
                                w * DAY_W,
                                topPos
                              )
                            }
                            />
                            <div className="bar-progress" style={{ width: progressPct(start, end) + '%' }} />
                            <span className="bar-content">{task.projectName} · {task.name}</span>
                            <div
                              className="bar-resize right"
                              onPointerDown={(ev) =>
                              handlePointerDown(
                                ev,
                                task,
                                'resize-end',
                                start * DAY_W,
                                w * DAY_W,
                                topPos
                              )
                            }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {todayIdx >= 0 && (
            <div
              className="today-line"
              ref={todayLineRef}
              style={{ left: LABEL_W + todayIdx * DAY_W + DAY_W / 2 - 1 + 'px' }}
            />
          )}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="legend-sw proj" /> Project span</div>
        <div className="legend-item"><span className="legend-sw task" /> Task</div>
        <div className="legend-item"><span className="legend-sw today-sw" /> Today</div>
        <div className="legend-item"><span className="legend-sw conflict-sw" /> Scheduling conflict</div>
        <div className="legend-item">Darker shading = progress</div>
        <div className="legend-spacer" />
        <span>Drag bars to reschedule · click to edit</span>
      </div>
    </div>
  );
}

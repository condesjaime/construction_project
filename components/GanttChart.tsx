'use client';

import React, { useEffect, useMemo, useRef } from 'react';

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
  teams?: string[];
}

interface GanttChartProps {
  /** Inclusive list of every day in the timeline (sorted ascending). */
  weekDates?: Date[];
  /** Tasks grouped by project/team — flattened into a single ordered list. */
  groupedTasks: Record<string, { name: string; color: string; tasks: TaskData[] }>;
  onTaskClick: (task: TaskData) => void;
  /** Project palette key (p1..p5) for themed colour. */
  themeColor?: string;
}

const DAY_W = 30;
const LABEL_W = 360;

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
function dayIndexOf(date: Date, dates: Date[]) {
  for (let i = 0; i < dates.length; i++) {
    if (sameDay(dates[i], date)) return i;
  }
  // Fallback: closest by ms diff (clamped)
  const t = date.getTime();
  if (t <= dates[0].getTime()) return 0;
  if (t >= dates[dates.length - 1].getTime()) return dates.length - 1;
  return 0;
}
function statusClassName(t: TaskData) {
  if (t.isMilestone || t.status === 'milestone') return 'milestone';
  return t.status;
}
function durationLabel(start: Date, end: Date) {
  const d = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  return d === 1 ? '1 day' : d + ' days';
}

export function GanttChart({
  weekDates,
  groupedTasks,
  onTaskClick,
  themeColor = 'p1',
}: GanttChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const todayLineRef = useRef<HTMLDivElement>(null);

  // Build the timeline either from provided dates, or derive from tasks (min/max).
  const dates = useMemo<Date[]>(() => {
    if (weekDates && weekDates.length > 0) return weekDates;

    const allTasks = Object.values(groupedTasks).flatMap((g) => g.tasks);
    if (allTasks.length === 0) {
      const today = new Date();
      const start = addDays(today, -7);
      const arr: Date[] = [];
      for (let i = 0; i < 42; i++) arr.push(addDays(start, i));
      return arr;
    }
    let min = allTasks[0].startDate;
    let max = allTasks[0].endDate;
    for (const t of allTasks) {
      if (t.startDate < min) min = t.startDate;
      if (t.endDate > max) max = t.endDate;
    }
    // Snap min to Monday, extend max to Sunday, pad ±1 week
    const start = new Date(min);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7);
    const end = new Date(max);
    end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7)) + 7);
    const arr: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  }, [weekDates, groupedTasks]);

  const totalDays = dates.length;
  const totalWeeks = Math.ceil(totalDays / 7);

  const today = new Date();
  const todayIdx = useMemo(() => {
    for (let i = 0; i < dates.length; i++) {
      if (sameDay(dates[i], today)) return i;
    }
    return -1;
  }, [dates]);

  const flatTasks = useMemo(
    () => Object.values(groupedTasks).flatMap((g) => g.tasks),
    [groupedTasks]
  );

  // Compose CSS variable scope for the project color theme
  const themeClass = `theme-${themeColor || 'p1'}`;

  useEffect(() => {
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;
    const todayEl = todayLineRef.current;
    if (!headerEl || !bodyEl || !todayEl) return;
    todayEl.style.height = bodyEl.offsetHeight + 'px';
    todayEl.style.top = headerEl.offsetHeight + 'px';
  }, [dates, groupedTasks]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (todayIdx >= 0) {
      wrap.scrollLeft = Math.max(0, todayIdx * DAY_W - 120);
    }
  }, [todayIdx]);

  const renderWeekendStripes = () =>
    dates.map((d, i) =>
      d.getDay() === 6 ? (
        <div
          key={`ws-${i}`}
          className="weekend-stripe"
          style={{ left: i * DAY_W + 'px' }}
        />
      ) : null
    );

  return (
    <div className={`gantt-proto ${themeClass}`}>
      <div className="gantt-wrap" ref={wrapRef}>
        <div className="gantt" ref={ganttRef}>
          {/* Header */}
          <div className="gantt-header" ref={headerRef}>
            <div className="header-label-cell">Task</div>
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

          {/* Body */}
          <div className="gantt-body" ref={bodyRef}>
            {flatTasks.map((task) => {
              const isMilestone = task.isMilestone || task.status === 'milestone';
              const startIdx = dayIndexOf(task.startDate, dates);
              const endIdx = dayIndexOf(task.endDate, dates);
              const left = startIdx * DAY_W;
              const widthDays = Math.max(1, endIdx - startIdx + 1);
              const teams =
                task.teams && task.teams.length > 0
                  ? task.teams
                  : task.teamName
                  ? [task.teamName]
                  : [];

              const progress =
                endIdx < todayIdx
                  ? 100
                  : startIdx > todayIdx || todayIdx < 0
                  ? 0
                  : Math.max(
                      0,
                      Math.min(100, ((todayIdx - startIdx + 1) / (endIdx - startIdx + 1)) * 100)
                    );

              return (
                <div key={task.id} className={`row${isMilestone ? ' row-milestone' : ''}`}>
                  <div className="row-label">
                    <div className="task-label-content">
                      <div className="task-name-row">
                        <span className={`task-status-dot ${statusClassName(task)}`} />
                        <span className="task-name">{task.name}</span>
                        <span className="task-duration">
                          {isMilestone ? fmtDate(task.startDate) : durationLabel(task.startDate, task.endDate)}
                        </span>
                      </div>
                      {teams.length > 0 && (
                        <div className="task-teams">
                          {teams.map((t, i) => (
                            <span
                              key={`${task.id}-team-${i}`}
                              className={`team-chip${teams.length > 1 ? ' is-multi' : ''}`}
                            >
                              <span className="team-dot" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="row-timeline"
                    style={{ width: totalDays * DAY_W + 'px' }}
                  >
                    {renderWeekendStripes()}
                    {isMilestone ? (
                      <button
                        type="button"
                        className="milestone"
                        style={{ left: left + DAY_W / 2 + 'px' }}
                        data-tooltip={`${task.name} · ${fmtDateLong(task.startDate)}`}
                        onClick={() => onTaskClick(task)}
                        aria-label={task.name}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`bar status-${task.status}`}
                        style={{
                          left: left + 'px',
                          width: widthDays * DAY_W + 'px',
                        }}
                        data-tooltip={`${task.name} · ${teams.join(' + ') || '—'} · ${fmtDateLong(task.startDate)} → ${fmtDateLong(task.endDate)}`}
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="bar-progress" style={{ width: progress + '%' }} />
                        <span className="bar-content">{task.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

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
        <div className="legend-item"><span className="legend-sw done" /> Done</div>
        <div className="legend-item"><span className="legend-sw progress" /> In progress</div>
        <div className="legend-item"><span className="legend-sw planned" /> Planned</div>
        <div className="legend-item"><span className="legend-sw milestone" /> Milestone</div>
        <div className="legend-item"><span className="legend-sw today-sw" /> Today</div>
        <div className="legend-spacer" />
        <span>Click a task to edit</span>
      </div>
    </div>
  );
}

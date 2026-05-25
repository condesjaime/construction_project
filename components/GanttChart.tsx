'use client';

import { Dot, Eye, PenBoxIcon, Pencil, Plus, PlusCircleIcon, CornerDownRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

export interface TaskData {
  uniqueId:string;
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
  isSubtask?: boolean;
  progress?: number;
  parentTaskId?: string;
}

interface GanttChartProps {
  weekDates?: Date[];
  groupedTasks: Record<string, { name: string; color: string; tasks: TaskData[] }>;
  onTaskClick?: (task: TaskData) => void;
  onSubtaskClick?: (task: TaskData) => void;
  onAddTask?: ()=>void;
  onEditSubTask?: (task: TaskData) => void;
   onEditTask?: (task: TaskData) => void;
  onAddSubTask?: (task: TaskData) => void;
  onTaskReschedule?: (
    taskId: string,
    newStart: Date,
    newEnd: Date,
    isSubtask?: boolean,
  ) => void;
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
  onSubtaskClick,
  onTaskReschedule,
  onAddTask,
  onAddSubTask,
  onEditSubTask,
  onEditTask,
  themeColor = 'p1',
}: GanttChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const todayLineRef = useRef<HTMLDivElement>(null);
const [hoveredTask, setHoveredTask] = React.useState<string | null>(null);
type DragMode = 'move' | 'resize-start' | 'resize-end';

const dragRef = useRef<{
  isSubtask?:boolean;
  taskId: string;
  mode: DragMode;
  startX: number;
  origStart: Date;
  origEnd: Date;
  initialLeft: number;
  initialWidth: number;
} | null>(null);

const [draggingId, setDraggingId] = React.useState<string | null>(null);
const [dragPreview, setDragPreview] = React.useState<{
  left: number;
  width: number;
} | null>(null);
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
const handlePointerDown = (
  e: React.PointerEvent,
  task: TaskData,
  mode: DragMode,
  left: number,
  width: number
) => {
  e.preventDefault();
  e.stopPropagation();

  dragRef.current = {
    isSubtask: task.isSubtask,
    taskId: task.id,
    mode,
    startX: e.clientX,
    origStart: new Date(task.startDate),
    origEnd: new Date(task.endDate),
    initialLeft: left,
    initialWidth: width,
  };

  setDraggingId(task.id);

  setDragPreview({
    left,
    width,
  });

  document.body.style.cursor = 'grabbing';
};
useEffect(() => {
  if (!draggingId) return;

  const onMove = (e: PointerEvent) => {
    if (!dragRef.current) return;

    const {
      isSubtask,
      mode,
      startX,
      initialLeft,
      initialWidth,
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
    });
  };

  const onUp = (e: PointerEvent) => {
    if (!dragRef.current) return;

    const {
      isSubtask,
      taskId,
      mode,
      startX,
      origStart,
      origEnd,
    } = dragRef.current;

    const deltaDays = Math.round((e.clientX - startX) / DAY_W);

    let newStart = new Date(origStart);
    let newEnd = new Date(origEnd);

    if (mode === 'move') {
      newStart = addDays(origStart, deltaDays);
      newEnd = addDays(origEnd, deltaDays);
    }

    if (mode === 'resize-end') {
      newEnd = addDays(origEnd, deltaDays);

      if (newEnd < newStart) {
        newEnd = new Date(newStart);
      }
    }

    if (mode === 'resize-start') {
      newStart = addDays(origStart, deltaDays);

      if (newStart > newEnd) {
        newStart = new Date(newEnd);
      }
    }

    onTaskReschedule?.(taskId, newStart, newEnd, isSubtask);

    setDraggingId(null);
    setDragPreview(null);

    dragRef.current = null;

    document.body.style.cursor = '';
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}, [draggingId, onTaskReschedule]);

const handleTaskClick = (task: TaskData) => {
  if (task.isSubtask) {
    onSubtaskClick?.(task);
  } else {
    onTaskClick?.(task);
  }
};
  return (
    <div className={`gantt-proto ${themeClass}`}>
      <div className="gantt-wrap" ref={wrapRef}>
        <div className="gantt" ref={ganttRef}>
          {/* Header */}
          <div className="gantt-header" ref={headerRef}>
            <div className="header-label-cell">
              <div className='flex w-full justify-between items-center'>
                <div className='w-1/2'>
                   Task
                </div>
                <div className='w-1/2 flex justify-end items-end'>
                   <button 
                   onClick={()=>{onAddTask?.()}}
                   className='rounded-lg app-bg-lime app-text-green px-3 py-2'>+ New Task</button>
                </div>
              </div>
            </div>
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
                <div key={`${task.isSubtask ? 'subtask' : 'task'}-${task.id}${task.uniqueId}`} className={`row${isMilestone ? ' row-milestone' : ''}`}>
                  <div className="row-label">
                    <div className="task-label-content">
                      <div className="task-name-row">
                        <span className={`task-status-dot ${statusClassName(task)}`} />
                        {task.isSubtask? (<><CornerDownRight size={15} /></>):""}
                        <span className="task-name">{task.name}</span>
                        
                        <span className="task-duration">
                          {isMilestone ? fmtDate(task.startDate) : durationLabel(task.startDate, task.endDate)}
                        </span>
                      </div>
                      {teams.length > 0 && (
                        <div className="task-teams">
                          {teams.slice(0, 2).map((t, i) => (
                            <span
                              key={`${task.id}-team-${i}`}
                              className={`team-chip${teams.length > 1 ? ' is-multi' : ''}`}
                            >
                              <span className="team-dot" />
                              {t}
                            </span>
                          ))}

                          {teams.length > 2 && (
                            <span className="team-chip more-teams">
                              +{teams.length - 2}
                            </span>
                          )}

                          
                          <div className='flex justify-end gap-2'>
                            <button 
                            onClick={()=>{
                              if(task.isSubtask){
                                onEditSubTask?.(task);
                              }else{
                                onEditTask?.(task);
                              } 
                              
                            }}
                          className='app-text-green hover:text-orange-800'>
                            <PenBoxIcon size={15} />
                          </button>

                          <button 
                            onClick={()=>{onAddSubTask?.(task)}}
                            className='app-text-green hover:text-orange-800'>
                            <PlusCircleIcon size={15} />
                          </button>
                          </div>
                          
                          </div>
                        )}
                      
                    </div>
                  </div>
                  <div
                    className="row-timeline"
                    style={{ width: totalDays * DAY_W + 'px' }}
                  >
                    {dragPreview && draggingId === task.id && (
                      <div
                        className="drag-preview-bar mt-3"
                        style={{
                          left: dragPreview.left + 'px',
                          width: dragPreview.width + 'px',
                        }}
                      />
                    )}
                    {renderWeekendStripes()}
                    {isMilestone ? (
                      <button
                        type="button"
                        className="milestone"
                        style={{ left: left + DAY_W / 2 + 'px' }}
                        data-tooltip={`${task.name} · ${fmtDateLong(task.startDate)}`}
                        onClick={() => handleTaskClick(task)}
                        aria-label={task.name}
                      />
                    ) : (
                      <div
                          className={`bar status-${task.status}${
                            draggingId === task.id ? ' dragging' : ''
                          }`}
                          style={{
                            left: left + 'px',
                            width: widthDays * DAY_W + 'px',
                          }}
                          data-tooltip={`${task.name} · ${
                            teams.join(' + ') || '—'
                          } · ${fmtDateLong(task.startDate)} → ${fmtDateLong(task.endDate)}`}
                          onPointerDown={(ev) =>
                            handlePointerDown(
                              ev,
                              task,
                              'move',
                              left,
                              widthDays * DAY_W
                            )
                          }
                          onClick={() => handleTaskClick(task)}
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
                                left,
                                widthDays * DAY_W
                              )
                            }
                          />

                          <div
                            className="bar-progress"
                            style={{ width: progress + '%' }}
                          />

                          <span className="bar-content">
                            {task.name}
                          </span>

                          <div
                            className="bar-resize right"
                            onPointerDown={(ev) =>
                              handlePointerDown(
                                ev,
                                task,
                                'resize-end',
                                left,
                                widthDays * DAY_W
                              )
                            }
                          />
                        </div>
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
        <div className="legend-item"><span className="legend-sw blocked" /> Blocked</div>
        <div className="legend-item"><span className="legend-sw today-sw" /> Today</div>
        <div className="legend-spacer" />
        <span>Drag/Extend bars to reschedule. click to edit</span>
      </div>
    </div>
  );
}

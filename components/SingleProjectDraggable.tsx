'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { TaskData } from './GanttChart';


interface SingleProjectGanttProps {
  projectName: string;
  projectData?: {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    client: string;
    addressLine1:string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    color: string;
    progress: number;
  }
  tasks: TaskData[];
  weeks: Date[][];
  onTaskClick?: (task: TaskData) => void;
  onTaskReschedule?: (
    taskId: string,
    startDate: Date,
    endDate: Date
  ) => void;
}

const DAY_W = 32;
const LABEL_W = 360;
const ROW_H = 52;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function flattenDates(weeks: Date[][] | Date[]) {
  if (
    Array.isArray(weeks) &&
    weeks.length > 0 &&
    Array.isArray((weeks as any)[0])
  ) {
    return (weeks as Date[][]).flat();
  }

  return weeks as Date[];
}

function dayIndexOf(date: Date, dates: Date[]) {
  for (let i = 0; i < dates.length; i++) {
    if (sameDay(dates[i], date)) {
      return i;
    }
  }

  return 0;
}

function formatHeaderDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SingleProjectGantt({
  projectName,
  projectData,
  tasks,
  weeks,
  onTaskClick,
  onTaskReschedule,
}: SingleProjectGanttProps) {
  const dates = useMemo(() => flattenDates(weeks), [weeks]);

  const totalDays = dates.length;

  const wrapRef = useRef<HTMLDivElement>(null);

  const today = new Date();

  const todayIndex = useMemo(() => {
    return dates.findIndex((d) => sameDay(d, today));
  }, [dates]);

  useEffect(() => {
    if (!wrapRef.current) return;

    if (todayIndex >= 0) {
      wrapRef.current.scrollLeft =
        todayIndex * DAY_W - 300;
    }
  }, [todayIndex]);

  const taskMap = useMemo(() => {
    const map = new Map<string, TaskData[]>();

    tasks.forEach((task) => {
      if (task.isSubtask && task.parentTaskId) {
        if (!map.has(task.parentTaskId)) {
          map.set(task.parentTaskId, []);
        }

        map.get(task.parentTaskId)?.push(task);
      }
    });

    return map;
  }, [tasks]);

  const mainTasks = useMemo(() => {
    return tasks.filter((t) => t.isSubtask === false);
  }, [tasks]);

  const [expanded, setExpanded] = useState<
    Record<string, boolean>
  >(() => {
    const state: Record<string, boolean> = {};

    mainTasks.forEach((task) => {
      state[task.id] = true;
    });

    return state;
  });

  type DragMode =
    | 'move'
    | 'resize-start'
    | 'resize-end';

  const dragRef = useRef<{
    taskId: string;
    mode: DragMode;
    startX: number;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [dragPreview, setDragPreview] = useState<{
    taskId: string;
    left: number;
    width: number;
  } | null>(null);

  const handlePointerDown = (
    e: React.PointerEvent,
    task: TaskData,
    mode: DragMode
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      taskId: task.id,
      mode,
      startX: e.clientX,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
    };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const {
        taskId,
        mode,
        startX,
        startDate,
        endDate,
      } = dragRef.current;

      const deltaDays = Math.round(
        (e.clientX - startX) / DAY_W
      );

      let newStart = startDate;
      let newEnd = endDate;

      if (mode === 'move') {
        newStart = addDays(startDate, deltaDays);
        newEnd = addDays(endDate, deltaDays);
      }

      if (mode === 'resize-start') {
        newStart = addDays(startDate, deltaDays);
      }

      if (mode === 'resize-end') {
        newEnd = addDays(endDate, deltaDays);
      }

      const left =
        dayIndexOf(newStart, dates) * DAY_W;

      const width =
        (dayIndexOf(newEnd, dates) -
          dayIndexOf(newStart, dates) +
          1) *
        DAY_W;

      setDragPreview({
        taskId,
        left,
        width,
      });
    };

    const onUp = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const {
        taskId,
        mode,
        startX,
        startDate,
        endDate,
      } = dragRef.current;

      const deltaDays = Math.round(
        (e.clientX - startX) / DAY_W
      );

      let newStart = startDate;
      let newEnd = endDate;

      if (mode === 'move') {
        newStart = addDays(startDate, deltaDays);
        newEnd = addDays(endDate, deltaDays);
      }

      if (mode === 'resize-start') {
        newStart = addDays(startDate, deltaDays);
      }

      if (mode === 'resize-end') {
        newEnd = addDays(endDate, deltaDays);
      }

      onTaskReschedule?.(
        taskId,
        newStart,
        newEnd
      );

      dragRef.current = null;

      setDragPreview(null);
    };

    window.addEventListener('pointermove', onMove);

    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener(
        'pointermove',
        onMove
      );

      window.removeEventListener(
        'pointerup',
        onUp
      );
    };
  }, [dates, onTaskReschedule]);

  const renderTaskBar = (
    task: TaskData,
    indent = false
  ) => {
    const start =
      dayIndexOf(task.startDate, dates);

    const end =
      dayIndexOf(task.endDate, dates);

    const width =
      Math.max(1, end - start + 1) * DAY_W;

    const left = start * DAY_W;

    const progress = task.progress ?? 0;

    const isDragging =
      dragPreview?.taskId === task.id;

    return (
      <div
        key={task.id}
        className="flex border-b border-border"
        style={{ height: ROW_H }}
      >
        <div
          className={`flex items-center px-4 border-r border-border bg-white sticky left-0 z-20 ${
            indent ? 'pl-12' : ''
          }`}
          style={{
            width: LABEL_W,
            minWidth: LABEL_W,
          }}
        >
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
              {task.isSubtask === false && (
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [task.id]:
                        !prev[task.id],
                    }))
                  }
                  className="text-xs"
                >
                  {expanded[task.id]
                    ? '▼'
                    : '▶'}
                </button>
              )}

              <span
                className={`font-medium ${
                  task.isSubtask === true
                    ? 'text-sm text-gray-700'
                    : 'text-base'
                }`}
              >
                {task.name}
              </span>
            </div>

            {task.teams &&
              task.teams.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.teams.map(
                    (team, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        {team}
                      </span>
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        <div
          className="relative"
          style={{
            width: totalDays * DAY_W,
            minWidth: totalDays * DAY_W,
          }}
        >
          {dates.map((d, i) => {
            const isWeekend =
              d.getDay() === 0 ||
              d.getDay() === 6;

            return (
              <div
                key={i}
                className={`absolute top-0 bottom-0 border-r border-border/40 ${
                  isWeekend
                    ? 'bg-gray-50'
                    : ''
                }`}
                style={{
                  left: i * DAY_W,
                  width: DAY_W,
                }}
              />
            );
          })}

          {todayIndex >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10"
              style={{
                left:
                  todayIndex * DAY_W +
                  DAY_W / 2,
              }}
            />
          )}

          {isDragging && dragPreview ? (
            <div
              className="absolute top-3 h-8 rounded-lg bg-blue-300 opacity-40 z-20"
              style={{
                left: dragPreview.left,
                width: dragPreview.width,
              }}
            />
          ) : null}

          <div
            className={`absolute top-3 h-8 rounded-lg cursor-pointer overflow-hidden group ${
              task.isSubtask === true
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{
              left,
              width,
            }}
            onClick={() =>
              onTaskClick?.(task)
            }
            onPointerDown={(e) =>
              handlePointerDown(
                e,
                task,
                'move'
              )
            }
            title={`${task.name} (${formatLongDate(
              task.startDate
            )} → ${formatLongDate(
              task.endDate
            )})`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-black/20"
              style={{
                width: `${progress}%`,
              }}
            />

            <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-medium">
              {task.name}
            </div>

            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
              onPointerDown={(e) =>
                handlePointerDown(
                  e,
                  task,
                  'resize-start'
                )
              }
            />

            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
              onPointerDown={(e) =>
                handlePointerDown(
                  e,
                  task,
                  'resize-end'
                )
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full border border-border rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex border-b border-border sticky top-0 z-30 bg-white">
        <div
          className="flex items-center px-4 font-semibold border-r border-border sticky left-0 bg-white z-30"
          style={{
            width: LABEL_W,
            minWidth: LABEL_W,
          }}
        >
          {projectName}
        </div>

        <div
          className="flex"
          style={{
            width: totalDays * DAY_W,
            minWidth: totalDays * DAY_W,
          }}
        >
          {dates.map((date, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center border-r border-border text-xs ${
                date.getDay() === 0 ||
                date.getDay() === 6
                  ? 'bg-gray-50'
                  : ''
              }`}
              style={{
                width: DAY_W,
                minWidth: DAY_W,
                height: 60,
              }}
            >
              <span>
                {formatHeaderDate(date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        ref={wrapRef}
        className="overflow-auto"
      >
        {mainTasks.map((task) => (
          <React.Fragment key={task.id}>
            {renderTaskBar(task)}

            {expanded[task.id] &&
              taskMap
                .get(task.id)
                ?.map((subtask) =>
                  renderTaskBar(
                    subtask,
                    true
                  )
                )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
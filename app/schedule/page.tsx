'use client';

import React, { useMemo, useState, useEffect, use } from 'react';
import { TopBar } from '@/components/TopBar';
import { DraggableGanttChart } from '@/components/DraggableGanttChart';
import { GanttChart, type TaskData as GanttTask } from '@/components/GanttChart';
import { EnhancedTaskModal } from '@/components/EnhancedTaskModal';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {CreateTaskModal} from '@/components/CreateTaskModal';
import { formatDate, getThreeMonthsWeeks,formatOffsetDate,formatShortId,parseOffsetDate } from '@/lib/utils';
import { toast } from 'sonner';
interface TaskData {
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

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [groupBy, setGroupBy] = useState<'project' | 'team'>('project');
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
 
  // Mock data — five projects with overlapping team assignments to surface conflicts
  const [mockTasks, setMockTasks] = useState<TaskData[]>([]);
 
  useEffect(() => {
    getTasks();
  }, []);

  const updateTask = async(taskId: string, updatedData: any) => {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        const data = await response.json();
        toast.success('Task updated successfully');
        console.log('Updated task:', data);
    } catch (error) {
        toast.error('Failed to update task');
        console.error('Error updating task:', error);
    }
  };
  const getTasks = async () => {
    // In a real app, replace with API call to fetch tasks based on currentMonth range
    try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        const formattedTasks: GanttTask[] = data.map((task: any) => ({
              id: task.id,
              projectId: task.projectId,
              projectName: task.project?.name || '',
              projectColor: task.project?.color || 'p1',
              teamId: task.teamId,
              teamName: task.team?.name || 'Unknown Team',
              name: task.name,
              status: task.status,
              startDate: parseOffsetDate(formatOffsetDate(task.startDate)),
              endDate: parseOffsetDate(formatOffsetDate(task.endDate)),
              isMilestone: task.isMilestone || false,
              notes: task.notes,
              description: task.description,
              estimatedDays: task.estimatedDays,
              sortOrder: task.sortOrder,
              teams: task.teams || undefined,
            }));
        
            
        console.log('Fetched tasks:', data);
        setMockTasks(formattedTasks);
        return data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
    
    return mockTasks;
  };

  const { weeks, startDate, endDate } = useMemo(
    () => getThreeMonthsWeeks(currentMonth),
    [currentMonth]
  );

  const groupedTasks = useMemo(() => {
    if (groupBy === 'project') {
      return mockTasks.reduce(
        (acc, task) => {
          const key = task.projectId;
          if (!acc[key]) acc[key] = { name: task.projectName, color: task.projectColor, tasks: [] };
          acc[key].tasks.push(task);
          return acc;
        },
        {} as Record<string, { name: string; color: string; tasks: TaskData[] }>
      );
    }
    return mockTasks.reduce(
      (acc, task) => {
        const key = task.teamId;
        if (!acc[key]) acc[key] = { name: task.teamName, color: task.projectColor, tasks: [] };
        acc[key].tasks.push(task);
        return acc;
      },
      {} as Record<string, { name: string; color: string; tasks: TaskData[] }>
    );
  }, [groupBy, mockTasks]);

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };
  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleTaskClick = (task: TaskData) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleReschedule = (taskId: string, newStart: Date, newEnd: Date) => {
    setMockTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, startDate: newStart, endDate: newEnd } : t))
    );
    updateTask(taskId, { startDate: formatDate(newStart,'yyyy-MM-dd'), endDate: formatDate(newEnd,'yyyy-MM-dd') });
  };

  const projectCount = useMemo(
    () => new Set(mockTasks.map((t) => t.projectId)).size,
    [mockTasks]
  );
  const teamCount = useMemo(
    () => new Set(mockTasks.map((t) => t.teamId)).size,
    [mockTasks]
  );

  return (
    <div className="flex flex-col h-screen bg-white w-full">
      <TopBar
        title="Project Schedule"
        subtitle={
          groupBy === 'project'
            ? `${projectCount} projects · click a row to expand its tasks`
            : `${teamCount} teams · red rings flag scheduling conflicts`
        }
        breadcrumbs={[{ label: 'Schedule', href: '/schedule' }]}
        rightContent={
             <button 
             onClick={()=>setCreateModalOpen(true)}
             className="px-4 py-2 app-bg-lime app-text-green rounded-lg text-sm font-medium hover:app-bg-lime/90 flex items-center gap-2">
                <Plus size={16} />
                New Task
            </button>
        }
      />

      <div className="gantt-proto">
        <div className="gp-toolbar">
           
          <div className="gp-toolbar-left">
            {mockTasks.length} tasks · {projectCount} projects · {teamCount} teams
          </div>
          <div className="gp-toolbar-controls">
            <div className="view-toggle">
              <button
                className={groupBy === 'project' ? 'active' : ''}
                onClick={() => setGroupBy('project')}
              >
                By Project
              </button>
              <button
                className={groupBy === 'team' ? 'active' : ''}
                onClick={() => setGroupBy('team')}
              >
                By Team
              </button>
            </div>
            <div className="date-nav">
              <button className="gp-btn gp-btn-icon" onClick={handlePrevMonth} title="Previous">
                <ChevronLeft size={14} />
              </button>
              <span className="date-range">
                {formatDate(startDate, 'dd MMM')} — {formatDate(endDate, 'dd MMM yyyy')}
              </span>
              <button className="gp-btn gp-btn-icon" onClick={handleNextMonth} title="Next">
                <ChevronRight size={14} />
              </button>
            </div>
            <button className="gp-btn" onClick={() => setCurrentMonth(new Date())}>Today</button>
          </div>
        </div>
      </div>

      <DraggableGanttChart
        weeks={weeks}
        groupedTasks={groupedTasks}
        groupBy={groupBy}
        onTaskClick={handleTaskClick}
        onTaskReschedule={handleReschedule}
      />

      {isModalOpen && selectedTask && (
        <EnhancedTaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskUpdate={(taskId, updates) => {
            setMockTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
            );
          }}
        />
      )}
      {/* Create Task Modal */}
      {createModalOpen && (
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            getTasks(); // Refresh tasks after creating a new one
        }}
        />
      )}
    </div>
  );
}

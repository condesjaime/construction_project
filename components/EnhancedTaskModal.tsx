'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Plus, Minus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

interface EnhancedTaskModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TaskData>) => void;
}

export function EnhancedTaskModal({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
}: EnhancedTaskModalProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  if (!isOpen) return null;

  const handleNotify = () => {
    const message = `Task: ${task.name}
    Project: ${task.projectName}
    Team: ${task.teamName}
    Dates: ${formatDate(task.startDate)} to ${formatDate(task.endDate)}
    Status: ${task.status}`;
    console.log(message);
    setNotificationMessage(message);
  };

  const handleExtendDate = (type: 'start' | 'end', days: number) => {
    const newTask = { ...editedTask };
    if (type === 'start') {
      newTask.startDate = new Date(editedTask.startDate);
      newTask.startDate.setDate(newTask.startDate.getDate() - days);
    } else {
      newTask.endDate = new Date(editedTask.endDate);
      newTask.endDate.setDate(newTask.endDate.getDate() + days);
    }
    setEditedTask(newTask);
    if (onTaskUpdate) {
      onTaskUpdate(task.id, newTask);
    }
  };

  const getStatusColor = () => {
    const colors: Record<string, string> = {
      planned: 'bg-st-planned text-st-planned',
      in_progress: 'bg-st-progress text-st-progress',
      done: 'bg-st-done text-st-done',
      milestone: 'bg-accent text-accent',
      blocked: 'bg-red-500 text-red-500',
    };
    return colors[task.status] || 'bg-st-planned';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto p-6 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-text">{task.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project and Team */}
          <div>
            <div className="text-sm text-text-muted mb-2">Project</div>
            <div className="text-sm font-medium text-text">{task.projectName}</div>
          </div>

          <div>
            <div className="text-sm text-text-muted mb-2">Team</div>
            <div className="text-sm font-medium text-text">{task.teamName}</div>
          </div>

          {/* Dates with edit controls */}
          <div>
            <div className="text-sm text-text-muted mb-3">Schedule</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <div>
                  <div className="text-xs text-text-muted">Start Date</div>
                  <div className="font-mono text-sm text-text">
                    {formatDate(editedTask.startDate, 'dd MMM yyyy')}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExtendDate('start', 1)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                    title="Extend start date back 1 day"
                  >
                    <Minus size={14} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => handleExtendDate('start', -1)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                    title="Move start date forward 1 day"
                  >
                    <Plus size={14} className="text-text-muted" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <div>
                  <div className="text-xs text-text-muted">End Date</div>
                  <div className="font-mono text-sm text-text">
                    {formatDate(editedTask.endDate, 'dd MMM yyyy')}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExtendDate('end', -1)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                    title="Shorten end date by 1 day"
                  >
                    <Minus size={14} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => handleExtendDate('end', 1)}
                    className="p-1 hover:bg-surface rounded transition-colors"
                    title="Extend end date by 1 day"
                  >
                    <Plus size={14} className="text-text-muted" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-sm text-text-muted mb-2">Status</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 bg-surface-alt rounded-full text-sm font-medium ${getStatusColor()}`}>
              <div className="w-2 h-2 rounded-full bg-current opacity-70" />
              {task.status}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <div className="text-sm text-text-muted mb-2">Description</div>
              <div className="text-sm text-text">{task.description}</div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <div className="text-sm text-text-muted mb-2">Notes</div>
              <div className="text-sm text-text">{task.notes}</div>
            </div>
          )}

          {/* Notification UI */}
          {showNotification ? (
            <div className="bg-surface-alt border border-border rounded-lg p-4">
              <div className="text-sm font-semibold text-text mb-3">
                SMS Notification Preview
              </div>
              <div className="bg-white border border-border rounded p-3 text-xs text-text font-mono whitespace-pre-wrap mb-3 max-h-32 overflow-y-auto">
                {notificationMessage}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert('SMS notification logged (not actually sent)');
                    setShowNotification(false);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Confirm & Log
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-1 px-4 py-2 border border-border text-text rounded-lg text-sm font-medium hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNotify()}
              className="w-full px-4 py-3 app-bg-lime app-text-green border border-border rounded-lg text-sm font-medium text-text hover:bg-surface-alt/80 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Notify Subcontractor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

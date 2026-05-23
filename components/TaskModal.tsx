'use client';

import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
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

interface TaskModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  if (!isOpen) return null;

  const handleNotify = () => {
    // In a real app, this would send SMS
    const message = `Task: ${task.name}
Project: ${task.projectName}
Team: ${task.teamName}
Dates: ${formatDate(task.startDate)} to ${formatDate(task.endDate)}
Status: ${task.status}`;
    setNotificationMessage(message);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
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

          {/* Dates */}
          <div>
            <div className="text-sm text-text-muted mb-2">Schedule</div>
            <div className="text-sm text-text">
              {formatDate(task.startDate, 'dd MMM yyyy')} to{' '}
              {formatDate(task.endDate, 'dd MMM yyyy')}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-sm text-text-muted mb-2">Status</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-alt rounded-full text-sm font-medium text-text">
              <div className="w-2 h-2 rounded-full bg-st-progress" />
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
              <div className="bg-white border border-border rounded p-3 text-xs text-text font-mono whitespace-pre-wrap mb-3">
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
              onClick={() => setShowNotification(true)}
              className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-sm font-medium text-text hover:bg-surface-alt/80 transition-colors flex items-center justify-center gap-2"
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

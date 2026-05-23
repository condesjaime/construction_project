'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface DiaryEntryFormProps {
  pageName: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  projectId?: string;
  taskId?: string;
  projectData?: any[]; // Add this line to accept project data as a prop
  tasksData?: any[]; // Add this line to accept tasks data as a prop
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

export function DiaryEntryForm({
  pageName,
  onSubmit,
  onCancel,
  projectId,
  taskId,
  tasksData,
  projectData,
}: DiaryEntryFormProps) {
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    taskId: taskId || '',
    date: formatDate(new Date(), 'yyyy-MM-dd'),
    notes: '',
    photos: [] as UploadedFile[],
  });

  const [uploading, setUploading] = useState(false);
  
  const mockTasks = [
    { id: '1', name: 'Structural Demolition' },
    { id: '2', name: 'Electrical Rough-In' },
    { id: '3', name: 'Plumbing Installation' },
  ];

  // Upload files immediately after selecting
  const uploadFiles = async (files: FileList) => {
  const formData = new FormData();
   setUploading(true);
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  setFormData((prev) => ({
    ...prev,
    photos: [...prev.photos, ...data.files],
  }));
  console.log(data.files);
  setUploading(false);
};

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      date: new Date(formData.date),
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">
          New Diary Entry
        </h2>

        <button
          onClick={onCancel}
          className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Date
          </label>

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Project
          </label>
         {pageName==='diary' && (<>
          <select
            value={formData.projectId}
            onChange={(e) =>
              setFormData({
                ...formData,
                projectId: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Select a project...</option>

            {projectData?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
         </>)}
          
        </div>

        {/* Task */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Task
          </label>

          <select
            value={formData.taskId}
            onChange={(e) =>
              setFormData({
                ...formData,
                taskId: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Select a task...</option>

            {tasksData?.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Notes
          </label>

          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
            placeholder="What happened today? Any observations, issues, or progress?"
            rows={6}
            className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Photos / Files
          </label>

          <label className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center hover:border-border-strong transition-colors cursor-pointer">
            <Upload className="mb-3 text-text-muted" size={32} />

            <div className="text-sm text-text-muted text-center">
              Click to upload photos or files
            </div>

            <div className="text-xs text-text-muted mt-1">
              Supports single or multiple uploads
            </div>

            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  uploadFiles(e.target.files);
                }
              }}
              className="hidden"
            />
          </label>

          {/* Uploading */}
          {uploading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              Uploading files...
            </div>
          )}

          {/* Preview uploaded files */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {formData.photos.map((photo, index) => {
                const isImage = photo.type.startsWith('image');

                return (
                  <div
                    key={index}
                    className="relative border border-border rounded-lg overflow-hidden"
                  >
                    {isImage ? (
                      <div className="relative h-32 w-full">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-sm p-3 text-center">
                        {photo.name}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 px-4 py-3 app-bg-lime rounded-lg app-text-green hover:app-bg-accent/90 transition-colors disabled:opacity-50"
          >
            Save Entry
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 app-bg-surface-alt app-text-text rounded-lg font-medium hover:app-bg-surface-alt/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
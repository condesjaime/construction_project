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
  subtaskId?:string;
  photos?: UploadedFile[];
  videos?: UploadedFile[];
  notes?: string;
  entryDate?: string;
  initialData?: {
    id?: string;
    projectId?: string;
    taskId?: string;
    subtaskId?: string;
    date?: string | Date;
    notes?: string;

    photos?: UploadedFile[];
    videos?: UploadedFile[];
  };
  project?:{
    id: string;
      name?: string;
      description?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      client?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      color: string;
      progress: string;
      createdAt: string;
      updatedAt: string;
  }
  projectData?: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      client?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      color: string;
      progress: string;
      createdAt: string;
      updatedAt: string;
    }[];
  tasksData?: {
    id: string;
    projectId?: string;
    name?: string;
    description?:  string;
    status:  string;
    startDate:  string;
    endDate:  string;
    estimatedDays: number;
    notes:  string;
    isMilestone: boolean
    sortOrder: number;
    createdAt:  string;
    updatedAt:  string;
    
    project?: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      client?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      color: string;
      progress: string;
      createdAt: string;
      updatedAt: string;
    };
    team_assignment?:  {
      id:  string;
      taskId?:  string;
      projectId?:  string;
      teamId?:  string;
      sortOrder?:  string;
      createdAt?: string;
      updatedAt?: string;
    }[];

  }[];
}
interface UploadedFile {
  key?: string;
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
  subtaskId,
  tasksData,
  projectData,
  project,
  photos,
  videos,
  notes,
  entryDate,
  initialData,
}: DiaryEntryFormProps) {
  const [formData, setFormData] = useState({
  projectId:
    initialData?.projectId || projectId || '',

  taskId:
    initialData?.taskId || taskId || '',

  subtaskId:
    initialData?.subtaskId || subtaskId || '',

  date: initialData?.date
    ? formatDate(new Date(initialData.date), 'yyyy-MM-dd')
    : formatDate(new Date(), 'yyyy-MM-dd'),

  notes: initialData?.notes || '',

  photos: initialData?.photos || [],

  videos: initialData?.videos || [],
});

  const [uploading, setUploading] = useState(false);
  const [taskOptions, setTaskOptions] = useState<
  {
    key?: string;
    label?: string;
    value?: string;
  }[]
>([]);
 const [selectedMedia, setSelectedMedia] = useState<UploadedFile | null>(null);
 
useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    projectId: projectId || '',
    taskId: taskId || '',
    subtaskId: subtaskId || '',
    notes: notes || '',
    photos: photos || [],
    videos: videos || [],
    date: entryDate
      ? formatDate(new Date(entryDate), 'yyyy-MM-dd')
      : formatDate(new Date(), 'yyyy-MM-dd'),
  }));
}, [
  projectId,
  taskId,
  subtaskId,
  notes,
  photos,
  videos,
  entryDate,
]);

useEffect(() => {
  if (!formData.projectId || !tasksData) {
    setTaskOptions([]);
    return;
  }

  const dataOptions = tasksData.filter(
    (t) => t.projectId === formData.projectId
  );

  const tasks = dataOptions.map((e) => ({
    key: e.id,
    label: e.name,
    value: e.id,
  }));

  setTaskOptions(tasks);
}, [formData.projectId, tasksData]);

  // Upload files immediately after selecting
  const uploadFiles = async (files: FileList) => {
  const allowedFiles = Array.from(files).filter(
    (file) =>
      file.type.startsWith('image/') ||
      file.type.startsWith('video/')
  );

  if (allowedFiles.length === 0) return;

  const uploadData = new FormData();

  setUploading(true);

  allowedFiles.forEach((file) => {
    uploadData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadData,
    });

     const data = await response.json();
    
    const uploadedPhotos = data.files.filter((file: UploadedFile) =>
      file.type?.startsWith('image/')
    );

    const uploadedVideos = data.files.filter((file: UploadedFile) =>
      file.type?.startsWith('video/')
    );

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...uploadedPhotos],
      videos: [...(prev.videos || []), ...uploadedVideos],
    }));
  } catch (error) {
    console.error(error);
  } finally {
    setUploading(false);
  }
};

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

   const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
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
          
          {pageName==="project" && (<>
            <h1>{project?.name}</h1>
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
            {taskOptions.map((task) => (
                  <option key={task.key} value={task.value}>{task.label}</option>
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
            Photos / Videos
          </label>

          <label className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center hover:border-border-strong transition-colors cursor-pointer">
            <Upload className="mb-3 text-text-muted" size={32} />

            <div className="text-sm text-text-muted text-center">
              Click to upload photos or videos
            </div>

            <div className="text-xs text-text-muted mt-1">
              Supports single or multiple uploads
            </div>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
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

         <div className="flex flex-wrap gap-2 justify-start">
            {/* Photos */}
            {formData.photos.length > 0 &&
              formData.photos.map((photo, index) => {
                const isImage = photo.type.startsWith('image');

                return (
                  <div
                    key={`photo-${index}`}
                    onClick={() => setSelectedMedia(photo)}
                    className="relative border border-border rounded-lg overflow-hidden bg-black cursor-pointer group w-40 shrink-0"
                  >
                    {isImage && (
                      <div className="relative h-32 w-full">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                      {photo.name}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

            {/* Videos */}
            {formData.videos.length > 0 &&
              formData.videos.map((video, index) => {
                const isVideo = video.type.startsWith('video');

                return (
                  <div
                    key={`video-${index}`}
                    onClick={() => setSelectedMedia(video)}
                    className="relative border border-border rounded-lg overflow-hidden bg-black cursor-pointer group w-40 shrink-0"
                  >
                    {isVideo && (
                      <>
                        <video
                          src={video.url}
                          className="h-32 w-full object-cover"
                          muted
                          preload="metadata"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-full p-3 text-black">
                            ▶
                          </div>
                        </div>
                      </>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                      {video.name}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVideo(index);
                      }}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
          </div>
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
      {selectedMedia && (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
        <button
          type="button"
          onClick={() => setSelectedMedia(null)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
        >
          <X size={24} />
        </button>

        <div className="max-w-6xl max-h-[90vh] w-full flex items-center justify-center">
          {selectedMedia.type.startsWith('image') ? (
            <div className="relative w-full h-[90vh]">
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              className="max-h-[90vh] max-w-full rounded-lg"
            />
          )}
        </div>
      </div>
    )}
    </div>
  );
}
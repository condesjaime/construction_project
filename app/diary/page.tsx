'use client';

import React, { useState, useEffect, use } from 'react';
import { TopBar } from '@/components/TopBar';
import { X, Building, Calendar, Loader2} from 'lucide-react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { DiaryEntryForm } from '@/components/DiaryEntryForm';
import { type TaskData as GanttTask } from '@/components/GanttChart';
import Image from 'next/image';
import { formatDate, formatOffsetDate,formatShortId,parseOffsetDate } from '@/lib/utils';
import {fetchWithAuth} from '@/lib/auth/fetchwithAuth'
interface DiaryEntry {
  id: string;
  entryDate: Date;
  title: string;
  notes: string;
  mediaCount: number;
  updatedAt: Date;
  project:{
    id :string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    client: string;
    location: string;
    color: string;
    progress: string;
    createdAt: string;
    updatedAt: string; 
  },
  task:{
    id: string;
    name: string;
  },
  videos: {
    key?: string;
    url?: string;
    type?: string;
    name?: string;
  }[]; 
  photos: {
    key?: string;
    url?: string;
    type?: string;
    name?: string;
  }[]; // Assuming photos is an array of objects with url and type 
}

interface UploadedFile {
  key?: string;
  url?: string;
  name?: string;
  type?: string;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
const [mounted, setMounted] = useState(false);
const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    setMounted(true);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    setToken(storedToken);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  

 useEffect(() => {
  if(token){
    fetchDiary();
  }
    
    fetchProjects();
    fetchTasks();
 }, [token]);
 const [selectedMedia, setSelectedMedia] = useState<UploadedFile | null>(null);
 const fetchTasks = async () => {
   try {
     const response = await fetch(`/api/tasks`);
 
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
 
     setTasks(formattedTasks);
     console.log(formattedTasks);
   } catch (error) {
     console.error('Error fetching tasks:', error);
   }
 };

 const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
        const data = await response.json();
        console.log('Fetched projects:', data);
        setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    };

  const fetchDiary = async () => {
  try {
    const response = await fetchWithAuth('/api/diary', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/';
      return;
    }

    const data = await response.json();

    setDiaryEntries(data);

    console.log('Fetched diary entries:', data);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
  }
};
  const saveDiaryEntry = async (
  entry: {
    projectId: string;
    date: Date;
    notes: string;
    taskId: string;
    photos: string[];
    videos: string[];
  }
) => {
  try {
    const isEdit = !!editingEntry;

    const response = await fetchWithAuth(
      isEdit
        ? `/api/diary/${editingEntry.id}`
        : '/api/diary',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: entry.projectId,
          date: entry.date.toISOString(),
          title: `Entry for ${formatDate(
            entry.date,
            'dd MMM yyyy'
          )}`,
          notes: entry.notes,
          taskId: entry.taskId,
          photos: entry.photos,
          videos: entry.videos,
        }),
      }
    );

    if (response.ok) {
      fetchDiary();
      setShowForm(false);
      setEditingEntry(null);
    }
  } catch (error) {
    console.error('Error saving diary entry:', error);
  }
};
const handleEditEntry = (entry: DiaryEntry) => {
  setEditingEntry(entry);
  setShowForm(true);
};
  const handleDeleteEntry = async () => {
  if (!selectedDeleteId) return;

  try {
    setDeleting(true);

    const response = await fetchWithAuth(
      `/api/diary/${selectedDeleteId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      await fetchDiary();

      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    setDeleting(false);
  }
};

if(!diaryEntries){
    return <div className="flex items-center justify-center h-screen">Loading Entries...</div>;
  }
  // Group entries by date range
  const groupedEntries = diaryEntries.reduce(
    (acc, entry) => {
      const dateKey = formatDate(entry.entryDate, 'yyyy-MM');
      if (!acc[dateKey]) {
        acc[dateKey] = {
          label: formatDate(entry.entryDate, 'MMMM yyyy'),
          entries: [],
        };
      }
      acc[dateKey].entries.push(entry);
      return acc;
    },
    {} as Record<string, { label: string; entries: DiaryEntry[] }>
  );
if (!mounted) {
    return null;
  }

  
  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar
        title="Site Diary"
        subtitle="Project work history and daily logs"
        breadcrumbs={[{ label: 'Site Diary', href: '/diary' }]}
        rightContent={
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 app-bg-lime app-text-green rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            New Entry
          </button>
        }
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-bg">
        <div className="max-w-3xl mx-auto p-8">
          {showForm ? (
            <DiaryEntryForm
            pageName="diary"
            onSubmit={saveDiaryEntry}
            tasksData={tasks}
            projectData={projects}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
            }}
            projectId={editingEntry?.project?.id}
            taskId={editingEntry?.task?.id}
            notes={editingEntry?.notes}
            photos={
              editingEntry?.photos?.map((photo) => ({
                key: photo.key,
                url: photo.url ?? '',
                name: photo.name ?? '',
                type: photo.type ?? '',
              })) ?? []
            }
            videos={
              editingEntry?.videos?.map((video) => ({
                key: video.key,
                url: video.url ?? '',
                name: video.name ?? '',
                type: video.type ?? '',
              })) ?? []
            }
            entryDate={
              editingEntry?.entryDate
                ? new Date(editingEntry.entryDate).toISOString()
                : undefined
            }
          />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEntries).map(([key, group]) => (
                <div key={key}>
                  <h2 className="text-lg font-semibold text-text-muted mb-4">
                  </h2>
                  <div className="space-y-3">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong transition-colors"
                      >
                        {/* Entry header */}
                        <button
                          onClick={() =>
                            setExpandedEntry(
                              expandedEntry === entry.id ? null : entry.id
                            )
                          }
                          className="w-full p-4 flex items-start justify-between text-left hover:bg-surface-alt transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div>
                                <div className="font-semibold text-text">
                                  {formatDate(entry.entryDate, 'MM dd, yyyy')}
                                </div>
                                <div className="text-sm text-text-muted mt-1">
                                  <div className='flex justify-start'>
                                  <span className={`flex text-md text-text py-2 px-3 gap-2 rounded-full bg-gray-100`}> 
                                   <Building size={18} /> Project: {entry.project.name}
                                   </span>
                                  </div>
                                  <div className='flex justify-start mt-1'>
                                  <span className={`flex text-md text-text py-2 px-3 gap-2 rounded-full bg-gray-100`}> 
                                   <Calendar size={18} /> Task: {entry.task.name}
                                   </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-surface-alt border border-border rounded-full overflow-hidden">
                                    <div
                                      className={`h-full app-bg-lime`}
                                      style={{ width: `${entry.project.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-mono text-text-muted min-w-12 text-right">
                                    {entry.project.progress}%
                                  </span>
                                </div>
                                 <div></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {entry.photos.length > 0 && (
                              <div className="text-xs bg-gray-200 px-2 py-1 rounded-full text-text-muted">
                               <span className='app-text-green'>{entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span> 
                              </div>
                            )}
                            {entry.videos.length > 0 && (
                              <div className="text-xs bg-gray-200 px-2 py-1 rounded-full text-text-muted">
                               <span className='app-text-green'>{entry.videos.length} video{entry.videos.length > 1 ? 's' : ''}</span> 
                              </div>
                            )}
                            <ChevronDown
                              size={18}
                              className={`text-text-muted transition-transform ${
                                expandedEntry === entry.id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Expanded content */}
                        {expandedEntry === entry.id && (
                          <div className="px-4 pb-4 border-t border-border">
                           <div className="mt-2">
                           <label>Notes</label>
                            <div className="border rounded-lg border-border w-full p-2">
                            <p className="text-sm text-text py-2">{entry.notes}</p>
                            </div>
                            
                            
                           </div>
                           
                            <div className="flex flex-wrap gap-3 justify-start mt-2">
                                        {/* Photos */}
                                        {entry.photos.length > 0 &&
                                          entry.photos.map((photo, index) => {
                                            const isImage = photo.type?.startsWith('image');
                            
                                            return (
                                              <div
                                                key={`photo-${index}`}
                                                onClick={() => setSelectedMedia(photo)}
                                                className="relative border border-border rounded-lg overflow-hidden bg-black cursor-pointer group w-40 shrink-0"
                                              >
                                                {isImage && (
                                                  <div className="relative h-32 w-full">
                                                    <Image
                                                      src={photo.url ?? ''}
                                                      alt={photo.name ?? ''}
                                                      fill
                                                      className="object-cover"
                                                    />
                                                  </div>
                                                )}
                            
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                                                  {photo.name}
                                                </div>
                            
                                                
                                              </div>
                                            );
                                          })}
                            
                                        {/* Videos */}
                                        {entry.videos.length > 0 &&
                                          entry.videos.map((video, index) => {
                                            const isVideo = video.type?.startsWith('video');
                            
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
                            
                                                
                                              </div>
                                            );
                                          })}
                                      </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-border">
                              <button
                              onClick={() => handleEditEntry(entry)}
                              className="flex-1 px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-alt rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDeleteId(entry.id);
                                  setDeleteModalOpen(true);
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
          {selectedMedia?.type?.startsWith('image') ? (
            <div className="relative w-full h-[90vh]">
              <Image
                src={selectedMedia.url ?? ''}
                alt={selectedMedia.name ?? ''}
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
    {deleteModalOpen && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="text-red-600" size={28} />
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-900">
          Delete Diary Entry
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          This action cannot be undone. This will permanently remove the diary entry and its media references.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-6">
        <button
          type="button"
          onClick={() => {
            setDeleteModalOpen(false);
            setSelectedDeleteId(null);
          }}
          disabled={deleting}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleDeleteEntry}
          disabled={deleting}
          className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

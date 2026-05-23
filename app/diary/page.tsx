'use client';

import React, { useState, useEffect, use } from 'react';
import { TopBar } from '@/components/TopBar';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { DiaryEntryForm } from '@/components/DiaryEntryForm';
import { type TaskData as GanttTask } from '@/components/GanttChart';
import Image from 'next/image';
import { formatDate, formatOffsetDate,formatShortId,parseOffsetDate } from '@/lib/utils';
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
  photos: {
    key?: string;
    url?: string;
    type?: string;
    name?: string;
  }[]; // Assuming photos is an array of objects with url and type 
}


// const mockEntries: DiaryEntry[] = [
//   {
//     id: '1',
//     date: new Date(2026, 4, 20),
//     taskName: 'Structural Demolition',
//     notes: 'Completed removal of interior walls. Structural beam installed and secured. Site cleaned and prepped for electrical work.',
//     mediaCount: 4,
//     photos: ['photo1', 'photo2', 'photo3', 'photo4'],
//     updatedAt: new Date(2026, 4, 20, 17, 0),
//   },
//   {
//     id: '2',
//     date: new Date(2026, 4, 19),
//     taskName: 'Structural Demolition',
//     notes: 'Continuation of wall demolition. Removed load-bearing wall with temporary shoring in place. Asbestos survey completed - no findings.',
//     mediaCount: 2,
//     photos: ['photo5', 'photo6'],
//     updatedAt: new Date(2026, 4, 19, 16, 30),
//   },
//   {
//     id: '3',
//     date: new Date(2026, 4, 15),
//     taskName: 'Site Preparation',
//     notes: 'Initial site setup. Temporary barriers installed, utilities surveyed, and equipment staged.',
//     mediaCount: 3,
//     photos: ['photo7', 'photo8', 'photo9'],
//     updatedAt: new Date(2026, 4, 15, 15, 0),
//   },
// ];

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
 useEffect(() => {
    fetchDiary();
    fetchProjects();
    fetchTasks();
 }, []);
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
      const response = await fetch(`/api/diary`)
      const data = await response.json();
      setDiaryEntries(data);
      console.log('Fetched diary entries:', data);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      return [];
    }
  };
  const saveDiaryEntry = async (entry: { projectId: string; date: Date; notes: string; taskId: string, photos: string[] }) => {
      
      console.log('Saving diary entry:', entry);
      try{
        //save to db
        const response= await fetch('/api/diary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: entry.projectId,
            date: entry.date.toISOString(),
            title: `Entry for ${formatDate(entry.date, 'dd MMM yyyy')}`,
            notes: entry.notes,
            taskId: entry.taskId,
            photos: entry.photos
          }),
        });
  
        if(response.ok){
          fetchDiary(); // Refresh the diary entries after saving
        }
      }catch(error){
        console.error('Error saving diary entry:', error);
      }
      setShowForm(false)
  
    };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
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
              pageName='diary'
              onSubmit={saveDiaryEntry}
              tasksData={tasks}
              projectData={projects}
              onCancel={() => setShowForm(false)}
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
                                  {entry.title}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {entry.mediaCount > 0 && (
                              <div className="text-xs bg-surface-alt px-2 py-1 rounded text-text-muted">
                                {entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}
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
                            {/* Notes */}
                            <p className="text-md text-text py-2">Project: {entry.project.name}</p>
                            <p className="text-md text-text py-2">Task: {entry.task.name}</p>
                            <p className="text-sm text-text py-2">Notes: {entry.notes}</p>

                            {/* Media preview */}
                            {entry.photos.length > 0 && (
                              <div>
                                <div className="text-xs text-text-muted font-semibold mb-3 uppercase">
                                  Media
                                </div>
                                <div className="flex gap-2 mb-4">
                                  {entry.photos.length > 0 && (
                                  <div className="flex justify-start gap-3 mt-4">
                                    {entry.photos.map((photo, index) => {
                                      const isImage = photo.type?.startsWith('image');
                                                                    
                                      return (
                                        <div
                                          key={index}
                                          className="relative w-40 border border-border rounded-lg overflow-hidden"
                                        >
                                          {isImage ? (
                                            <div className="relative h-32 w-full hover:border-2 border-lime-500">
                                              <Image
                                                src={photo.url ?? ''}
                                                alt={photo.name ?? 'Photo'}
                                                fill
                                                className="object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <div className="h-32 flex items-center justify-center text-sm p-3 text-center">
                                              {photo.name}
                                            </div>
                                         )}
                                        </div>
                                       );
                                    })}
                                   </div>
                                )}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-border">
                              <button className="flex-1 px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-alt rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
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
    </div>
  );
}

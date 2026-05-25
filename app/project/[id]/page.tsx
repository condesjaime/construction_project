'use client';

import React, { use, useMemo, useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, Button } from '@/components/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { GanttChart, type TaskData as GanttTask } from '@/components/GanttChart';
import { DiaryEntryForm } from '@/components/DiaryEntryForm';
import { formatDate, formatOffsetDate,formatShortId,parseOffsetDate } from '@/lib/utils';
import Image from 'next/image';
import { MapPin, User, Building2, Filter, Plus } from 'lucide-react';
import { Edit2, Trash2, ChevronDown } from 'lucide-react';

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

interface DiaryEntry {
  id: string;
  entryDate: Date;
  title: string;
  notes: string;
  mediaCount: number;
  updatedAt: Date;
  photos: {
    key?: string;
    url?: string;
    type?: string;
    name?: string;
  }[]; // Assuming photos is an array of objects with url and type 
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  

   const [project, setProject] = useState<any>(null);
   const [tasks, setTasks] = useState<GanttTask[]>([]);
   const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
   const [rawtasks, setRawtasks]=useState<any>([]);
  useEffect(() => {
    if(id){
       fetchProject(id);
       fetchTasks(id);
       fetchDiary(id);
    }
  }, [id]);



  const fetchProject = async (projectId: string) => {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    const formattedProject = {
      id,
      code: formatShortId(data.id),
      name: data.name,
      description: data.description,
      client: data.client,
      address: data.location,
      manager: data.manager,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      progress: data.progress,
      color: data.color,
      
    }
    setProject(formattedProject);
    console.log(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
  }
};

const fetchTasks = async (projectId: string) => {
  try {
    const response = await fetch(`/api/tasks?projectId=${projectId}`);

    const data = await response.json();
    setRawtasks(data);
    const formattedTasks: GanttTask[] = data.map((task: any) => ({
      id: task.id,
      projectId: task.projectId,
      projectName: project?.name || '',
      projectColor: project?.color || 'p1',
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

  const fetchDiary = async (projectId: string) => {
    try {
      const response = await fetch(`/api/diary?projectId=${projectId}`)
      const data = await response.json();
      setDiaryEntries(data);
      console.log('Fetched diary entries:', data);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      return [];
    }
  };

  // const projects= {
  //   id,
  //   code: 'WMD-024',
  //   name: 'Westmead Office Refurbishment',
  //   description:
  //     'Complete office refurbishment including structural work, electrical, plumbing, and finishes',
  //   client: 'Westmead Medical Centre',
  //   address: '158 Hawkesbury Rd, Westmead',
  //   manager: 'Steven Trinh',
  //   status: 'in_progress',
  //   startDate: new Date(2026, 4, 12),
  //   endDate: new Date(2026, 5, 27),
  //   progress: 14,
  //   color: 'p1',
  // };
 
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt;
  };

  // const [taskss, settasks] = useState<GanttTask[]>(() => [
  //   { id: '1', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't1', teamName: 'In-House Crew A', name: 'Site preparation', status: 'done', startDate: d(-14), endDate: d(-10), isMilestone: false },
  //   { id: '2', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't2', teamName: 'Demolition Co', name: 'Demolition', status: 'in_progress', startDate: d(-7), endDate: d(-3), isMilestone: false },
  //   { id: '3', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't3', teamName: 'Apex Framing', name: 'Framing', status: 'planned', startDate: d(0), endDate: d(11), isMilestone: false },
  //   { id: '4', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't4', teamName: 'Steel Bros', name: 'Steel reinforcement', status: 'planned', startDate: d(2), endDate: d(6), isMilestone: false },
  //   { id: '5', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't5', teamName: 'Sparky Electrical', name: 'Electrical rough-in', status: 'planned', startDate: d(7), endDate: d(18), isMilestone: false },
  //   { id: '6', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't6', teamName: 'Cascade Plumbing', name: 'Plumbing rough-in', status: 'planned', startDate: d(9), endDate: d(18), isMilestone: false },
  //   { id: '7', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't7', teamName: 'Council Inspector', name: 'Services inspection', status: 'milestone', startDate: d(21), endDate: d(21), isMilestone: true },
  //   { id: '8', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't8', teamName: 'In-House Crew B', name: 'Drywall', status: 'planned', startDate: d(14), endDate: d(25), isMilestone: false },
  //   { id: '9', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't9', teamName: 'ProFinish Painting', name: 'Painting', status: 'planned', startDate: d(21), endDate: d(29), isMilestone: false, teams: ['ProFinish Painting', 'Apprentice Crew'] } as GanttTask,
  //   { id: '10', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't10', teamName: 'Joinery Plus', name: 'Carpentry & joinery', status: 'planned', startDate: d(24), endDate: d(31), isMilestone: false },
  //   { id: '11', projectId: project.id, projectName: project.name, projectColor: project.color, teamId: 't11', teamName: 'Project Team', name: 'Handover', status: 'milestone', startDate: d(33), endDate: d(33), isMilestone: true },
  // ]);

  const groupedTasks = useMemo(
  () => ({
    all: {
      name: project?.name || 'Project',
      color: project?.color || 'p1',
      tasks: tasks,
    },
  }),
  [project, tasks]
);

  // ===== Day-of/Day-X metrics for the project pill =====
  const totalDays = project
  ? Math.max(
      1,
      Math.round(
        (new Date(project.endDate).getTime() -
          new Date(project.startDate).getTime()) /
          86_400_000
      ) + 1
    )
  : 0;

const dayOfProject = project
  ? Math.max(
      0,
      Math.round(
        (today.getTime() -
          new Date(project.startDate).getTime()) /
          86_400_000
      ) + 1
    )
  : 0;

const dayOfClamped = Math.min(dayOfProject, totalDays);

const teamCount = useMemo(
  () => new Set(tasks.map((t) => t.teamId)).size,
  [tasks]
);

const milestoneCount = useMemo(
  () => tasks.filter((t) => t.isMilestone).length,
  [tasks]
);
  const saveDiaryEntry = async (entry: { date: Date; notes: string; taskId: string, photos: string[] }) => {
    // Here you would normally send the entry to your backend to be saved in the database
    console.log('Saving diary entry:', entry);
    try{
      //save to db
      const response= await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          date: entry.date.toISOString(),
          title: `Entry for ${formatDate(entry.date, 'dd MMM yyyy')}`,
          notes: entry.notes,
          taskId: entry.taskId,
          photos: entry.photos
        }),
      });

      if(response.ok){
        fetchDiary(project.id); // Refresh the diary entries after saving
      }
    }catch(error){
      console.error('Error saving diary entry:', error);
    }
    setShowDiaryForm(false);

  }
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

  const handleDeleteEntry = (id: string) => {
    setDiaryEntries(diaryEntries.filter((e) => e.id !== id));
  };

  if (!project) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading project...
    </div>
  );
}

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar
        title={project.name}
        subtitle={project.description}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: project.name }]}
      />

      <div className={`gantt-proto theme-${project.color}`}>
        <div className="project-card">
          <h1 className="project-title">{project.name}</h1>
          <div className="project-meta-row">
            <span className="meta-chip code">{project.code}</span>
            <span className="meta-chip">
              <Building2 />
              {project.client}
            </span>
            <span className="meta-chip">
              <MapPin />
              {project.address}
            </span>
            <span className="meta-chip">
              <User />
              {project.manager}
            </span>
          </div>
          <div className="project-stats-row">
            <span className="status-pill">
              <span className="pulse" />
              In Progress
            </span>
            <span className="day-info">
              {formatDate(project.startDate, 'dd MMM')} → {formatDate(project.endDate, 'dd MMM')} ·{' '}
              <strong>Day {dayOfClamped}</strong> of {totalDays}
            </span>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: project.progress + '%' }} />
            </div>
            <span className="progress-pct">{project.progress}%</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-surface border-b border-border px-8">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="diary">Site Diary</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-bg">
          <TabsContent value="schedule" className="m-0 flex flex-col h-full">
            <div className={`gantt-proto theme-${project.color}`}>
              <div className="gp-toolbar">
                <div className="gp-toolbar-left">
                  {tasks.length} tasks · {teamCount} teams · {milestoneCount} milestones
                </div>
                <div className="gp-toolbar-controls">
                  <span className="date-range">
                    {formatDate(project.startDate, 'dd MMM')} — {formatDate(project.endDate, 'dd MMM yyyy')}
                  </span>
                  <button className="gp-btn">
                    <Filter size={14} />
                    Filter
                  </button>
                </div>
              </div>
            </div>
            <GanttChart
              groupedTasks={groupedTasks}
              onTaskClick={() => {}}
              themeColor={project.color}
            />
          </TabsContent>

          <TabsContent value="diary" className="m-0 p-8">
            <Button 
                className="w-50 flex items-center justify-center gap-2 mx-auto" 
                onClick={() => setShowDiaryForm(true)}>
                  <Plus size={14} />
                  Create Entry
                </Button>
            {showDiaryForm ? (
              <DiaryEntryForm
                pageName='project'
                tasksData={rawtasks}
                onSubmit={saveDiaryEntry}
                onCancel={() => setShowDiaryForm(false)}
              />
            ) : (
              <div className="text-center py-12 px-6">
                {Object.entries(groupedEntries).map(([key, group]) => (
                <div key={key}>
                  
                  <div className="space-y-3">
                    {group.entries.map((entry: DiaryEntry) => (
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
                                  {formatDate(entry.entryDate, 'dd MMM yyyy')}
                                </div>
                                <div className="text-sm text-text-muted mt-1">
                                  {entry.title}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {entry.photos.length > 0 && (
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
                            <p className="text-sm text-text py-4">{entry.notes}</p>

                            {/* Media preview */}
                            {entry.photos.length > 0 && (
                              <div>
                                <div className="text-xs justify-start text-text-muted font-semibold mb-3 uppercase">
                                  Media
                                </div>
                                <div className="flex w-full gap-2 mb-4">
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
          </TabsContent>

          <TabsContent value="team" className="m-0 p-8">
            <Card className="p-6">
              <h3 className="font-semibold text-text mb-4">Teams</h3>
              <div className="space-y-3">
                {Array.from(new Set(tasks.map((t) => t.teamName))).map((team) => (
                  <div key={team} className="flex items-center justify-between p-4 bg-surface-alt rounded-lg">
                    <span className="text-sm font-medium text-text">{team}</span>
                    <Button variant="ghost" size="sm">View Tasks</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="m-0 p-8">
            <Card className="p-6 max-w-2xl">
              <h3 className="font-semibold text-text mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted">Description</label>
                  <p className="text-sm text-text mt-1">{project.description}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

'use client';

import React, { use, useMemo, useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, Button } from '@/components/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { GanttChart, type TaskData as GanttTask } from '@/components/GanttChart';
import { DiaryEntryForm } from '@/components/DiaryEntryForm';
import {SingleProjectGantt} from '@/components/SingleProjectDraggable';
import { formatDate, formatOffsetDate,formatShortId,parseOffsetDate } from '@/lib/utils';
import Image from 'next/image';
import { MapPin, User, Building2, Filter, Plus } from 'lucide-react';
import { Edit2, Trash2, ChevronDown , Loader2, Calendar, Building, X} from 'lucide-react';
import {fetchWithAuth} from '@/lib/auth/fetchwithAuth';
import { toast } from 'sonner';
import { EnhancedTaskModal } from '@/components/EnhancedTaskModal';
import {CreateTaskModal} from '@/components/CreateTaskModal';
import {CreateSubTaskModal} from '@/components/CreateSubTaskModal';
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
  users?:{
    id: string;
    fullName: string;
    email: string;
  }
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

interface Teams{
  id:string;
  taskId:string;
  projectId:string;
  teamName: string;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [teams, setTeams] =useState();
   const [project, setProject] = useState<any>(null);
   const [projectData, setProjectData] = useState<any>(null);
   const [tasks, setTasks] = useState<GanttTask[]>([]);
   const [tasksOptions, setTasksOptions] = useState<GanttTask[]>([]);
   const [subtasks, setSubTasks] = useState<GanttTask[]>([]);
   const [tasksData, setTasksData]= useState<any>(null);
   const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
   const [rawtasks, setRawtasks]=useState<any>([]);
   const [token, setToken] = useState<string | null>(null);
   const [user, setUser] = useState<any>(null);
   const [mounted, setMounted] = useState(false);
   const [selectedMedia, setSelectedMedia]=useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [selectedSubTask, setSelectedSubTask] = useState<TaskData | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubtaskModalOpen, setCreateSubtaskModalOpen] = useState(false);
  const [editTaskModal, seteditTaskModal]= useState(false);
  const [editSubTaskModal, seteditSubTaskModal]= useState(false);
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
    if(id){
       fetchProject(id);
       fetchTasks(id);
       fetchDiary(id);
       fetchSubTasks(id);
       fetchTasksOptions(id);
    }
  }, [id]);



  const fetchProject = async (projectId: string) => {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    setProjectData(data);
    const formattedProject = {
      id,
      code: formatShortId(data.id),
      name: data.name,
      description: data.description,
      client: data.client,
      manager: data.manager,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      progress: data.progress,
      color: data.color,
      address: data.addressLine1 +" "+(data.city?data.city:'') +" "+ (data.state?data.state:'')+" "+(data.zipcode?data.zipcode:''),
      address2: data.addressLine2 +" "+(data.city?data.city:'') +" "+ (data.state?data.state:'')+" "+(data.zipcode?data.zipcode:''),
    }
    setProject(formattedProject);
    console.log(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
  }
};
const fetchTasksOptions = async (projectId: string) => {
  try {
    const response = await fetch(`/api/tasks?projectId=${projectId}`);

    const data = await response.json();
    setRawtasks(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

const fetchTasks = async (projectId: string) => {
  try {
    const response = await fetch(`/api/task-assignment?projectId=${projectId}`);

    const data = await response.json();
   
    const formattedTasks: GanttTask[] = data.map((task: any) => {
      // get only teams connected to the current task
      const teams = data
        .filter(
          (t: any) =>
            t.taskId === task.taskId &&
            t.teamId
        )
        .map((t: any) => t.team?.name)
        .filter(Boolean);

      return {
        uniqueId: task.id,
        id: task.task.id,
        projectId: task.project.id,
        projectName: project?.name || '',
        projectColor: project?.color || 'p1',

        teamId: task.team.id,
        teamName: task.team.name,

        name: task.task.name,
        status: task.task.status,

        startDate: parseOffsetDate(
          formatOffsetDate(task.task.startDate)
        ),

        endDate: parseOffsetDate(
          formatOffsetDate(task.task.endDate)
        ),

        isMilestone: task.task.isMilestone || false,
        notes: task.task.notes,
        description: task.task.description,
        estimatedDays: task.task.estimatedDays,
        sortOrder: task.task.sortOrder,

        // only teams related to this task
        teams,
      };
    });
    setTasks(formattedTasks);
    console.log(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

const fetchSubTasks = async (projectId: string) => {
  try {
    const response = await fetch(`/api/subtask-assignment?projectId=${projectId}`);

    const data = await response.json();
    
    const formattedTasks: GanttTask[] = data.map((task: any) => {
  // get only teams connected to the current task
  const teams = data
    .filter(
      (t: any) =>
        t.taskId === task.taskId &&
        t.teamId
    )
    .map((t: any) => t.team?.name)
    .filter(Boolean);

  return {
    uniqueId: task.id,
    id: task.subtaskId,
    projectId: task.project.id,
    projectName: project?.name || '',
    projectColor: project?.color || 'p1',

    teamId: task.team.id,
    teamName: task.team.name,

    name: task.task.name,
    status: task.task.status,

    startDate: parseOffsetDate(
      formatOffsetDate(task.task.startDate)
    ),

    endDate: parseOffsetDate(
      formatOffsetDate(task.task.endDate)
    ),

    isMilestone: task.task.isMilestone || false,
    notes: task.task.notes,
    description: task.task.description,
    estimatedDays: task.task.estimatedDays,
    sortOrder: task.task.sortOrder,

    // only teams related to this task
    teams,
    isSubtask: true,
    parentTaskId: task.task.id
  };
});

    setSubTasks(formattedTasks);
    console.log(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

  const fetchDiary = async (projectId: string) => {
    try {
      const response = await fetchWithAuth(`/api/diary?projectId=${projectId}`,{
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json();
       if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/';
      return;
    }
      setDiaryEntries(data);
      console.log('Fetched diary entries:', data);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      return [];
    }
  };

 
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt;
  };

 

 const groupedTasks = useMemo(() => {
  const uniqueMap = new Map();

  const combinedTasks = [...tasks, ...subtasks];

  combinedTasks.forEach((task: any) => {
    const key = task.taskId || task.id;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, task);
    }
  });

  return {
    all: {
      name: project?.name || 'Project',
      color: project?.color || 'p1',
      tasks: Array.from(uniqueMap.values()),
    },
  };
}, [project, tasks, subtasks]);

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
  () => new Set(groupedTasks.all.tasks?.map((t) => t.teams)).size,
  [groupedTasks]
);

const milestoneCount = useMemo(
  () => groupedTasks.all.tasks?.filter((t) => t.isMilestone).length || 0,
  [groupedTasks]
);
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
        toast.success("Diary updated");
        fetchDiary(id);
        setShowDiaryForm(false);
        setEditingEntry(null);
      }
    } catch (error) {
      toast.error("Failed to update diary");
      console.error('Error saving diary entry:', error);
    }
  };
  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setShowDiaryForm(true);
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
        await fetchDiary(id);
  
        setDeleteModalOpen(false);
        setSelectedDeleteId(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };
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

  const updateSubTask = async(taskId: string, updatedData: any) => {
    try {
        const response = await fetch(`/api/subtasks/${taskId}`, {
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
        toast.success('Sub-Task updated successfully');
        console.log('Updated task:', data);
    } catch (error) {
        toast.error('Failed to update sub-task');
        console.error('Error updating sub-task:', error);
    }
  };

 const handleTaskClick = (task: TaskData) => {
     setSelectedTask(task);
     setIsModalOpen(true);
   };
 
   const handleReschedule = async (
  taskId: string,
  newStart: Date,
  newEnd: Date,
  isSubtask?: boolean
) => {

  // Optimistic UI update
  if (isSubtask) {
    setSubTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate: newStart,
              endDate: newEnd,
            }
          : t
      )
    );
  } else {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate: newStart,
              endDate: newEnd,
            }
          : t
      )
    );
  }

  try {
    if (isSubtask) {
      await updateSubTask(taskId, {
        startDate: formatDate(newStart, 'yyyy-MM-dd'),
        endDate: formatDate(newEnd, 'yyyy-MM-dd'),
      });
    } else {
      await updateTask(taskId, {
        startDate: formatDate(newStart, 'yyyy-MM-dd'),
        endDate: formatDate(newEnd, 'yyyy-MM-dd'),
      });
    }

    // Refresh from server
    await Promise.all([
      fetchTasks(project.id),
      fetchSubTasks(project.id),
    ]);

  } catch (error) {
    console.error(error);

    // rollback if needed
    fetchTasks(project.id);
    fetchSubTasks(project.id);
  }
};

  if (!project) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading project...
    </div>
  );
}


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
            
          </div>
          <div className="project-stats-row">
            <span className="status-pill">
              <span className="pulse" />
              {project.status.toUpperCase()}
            </span>
            <span className="day-info">
              {formatDate(project.startDate, 'dd MM')} → {formatDate(project.endDate, 'dd MM')} ·{' '}
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
                  {groupedTasks.all.tasks?.length} tasks · {teamCount} teams · {milestoneCount} milestones
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
              onTaskReschedule={handleReschedule}
               onTaskClick={(task) => {
                setSelectedTask(task);
                seteditTaskModal(true);
                console.log(task);
              }}
              onSubtaskClick={(subtask) => {
                setSelectedSubTask(subtask);
                seteditSubTaskModal(true);
              }}
              onAddSubTask={()=>setCreateSubtaskModalOpen(true)}
              onAddTask={()=>setCreateModalOpen(true)}
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
                          pageName="project"
                          onSubmit={saveDiaryEntry}
                          projectData={projectData}
                          tasksData={rawtasks}
                          project={project}
                          onCancel={() => {
                            setShowDiaryForm(false);
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
                          <div className="w-[50%]">
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
                                </div>
                                
                              </div>
                            </div>
                            <div className='flex w-full justify-between items-center'>
                                  <div className='w-full'>
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
                                  </div>
                                    
                                 </div>
                          </div>

                          
                          <div className="flex items-center gap-2 ml-4">
                           
                                <span className='text-xs px-3 py-1 rounded-full bg-red-100'>By: {entry.users?.fullName}</span>
                                
                            
                            {entry.photos.length > 0 && (
                              <div className="text-xs bg-gray-200 px-2 py-1 rounded-full text-text-muted">
                               <span className='app-text-green w-[50px]'>{entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span> 
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
                           
                            <div className="flex flex-wrap gap-2 justify-start mt-2">
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

{isModalOpen && selectedTask && (
        <EnhancedTaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskUpdate={(taskId, updates, isSubtask) => {
            if(isSubtask){
               setSubTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
            );
            }else{
               setTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
            );
            }
           
          }}
        />
      )}
      {/* Create Task Modal */}
      {createModalOpen && (
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            fetchTasks(id);
            fetchSubTasks(id);
        }}
        />
      )}

      {createSubtaskModalOpen && (
        <CreateSubTaskModal
          isOpen={createSubtaskModalOpen}
          onClose={() => {
            setCreateSubtaskModalOpen(false);
            fetchTasks(id);
            fetchSubTasks(id);
        }}
        />
      )}
    </div>
  );
}

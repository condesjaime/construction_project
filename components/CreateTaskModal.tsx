'use client';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import {MultiSelect} from '@/components/DropDownSelect/MultipleSelectDropDown';


interface TaskData {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  teamIds: string[];
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
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({isOpen, onClose }: TaskModalProps) {
  

  if (!isOpen) return null;

   const [taskFormData, setTaskFormData] = useState({
    projectId: '',
    teamIds: [] as string[],
    name: '',
    description: '',
    status: 'planned',
    startDate:'',
    endDate: '',
    estimatedDays: 0,
    notes: '',
    isMilestone: false,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMilestone, setIsMilestone] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState(0);

  useEffect(() => {
    getProjects();
    getTeams();
  }, []);
 
  const getTeams = async () => {
    try {
      const response = await fetch('/api/teams');
        const data = await response.json();
        console.log('Fetched teams:',response);
        setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  const getProjects = async () => {
    try {
      const response = await fetch('/api/projects');
        const data = await response.json();
        console.log('Fetched projects:', data);
        setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    };

  const handleSubmit = async () => {
  console.log('Submitting task:', taskFormData);

  const start = new Date(taskFormData.startDate);
  const end = new Date(taskFormData.endDate);
  
  if(!taskFormData.startDate){
    toast.error("Start Date is Required!");
    return;
  }
   if(!taskFormData.endDate){
    toast.error("End Date is Required!");
    return;
  }
   if(!taskFormData.name){
    toast.error("Task name is Required!");
    return;
  }
  if(!taskFormData.projectId){
    toast.error("Select project is Required!");
    return;
  }
  if(!taskFormData.status){
    toast.error("Status is Required!");
    return;
  }
  const days = Math.ceil(
    (end.getTime() - start.getTime()) /
      (1000 * 3600 * 24)
  );
  
  // create updated object first
  const payload = {
    ...taskFormData,
    estimatedDays: days,
  };
  if(taskFormData.status === 'milestone') {
    payload.isMilestone = true;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
      
    }

    const data = await response.json();
     toast.success('Task created successfully');
    console.log('Created task:', data);

    onClose();
  } catch (error) {
    toast.error('Failed to create task');
    console.error('Error submitting task:', error);
  }
};
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto p-6 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex justify-between border-b border-border ">
          <div>Create Task</div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          {/* Project and Team */}
          <div className="flex flex-col">
            <div className="text-sm text-text-muted">Task Name</div>
            <input
            type="text"
            required
            value={taskFormData.name}
            onChange={(e) => setTaskFormData({...taskFormData, name: e.target.value})}
            className="border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>  
          
          <div>
            <div className="text-sm text-text-muted mb-2">Project</div>
            <div className="text-sm font-medium text-text">
              <select name="project" id="project" 
               required
              className="w-full border border-border rounded-lg px-3 py-2 bg-white flex items-center justify-between text-left"
              onChange={
                (e) => setTaskFormData({...taskFormData, projectId: e.target.value})
              }
              ><option key={0} value={""}>Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="text-sm text-text-muted mb-2">Team</div>
            <div className="text-sm font-medium text-text">
               <MultiSelect
                options={teams.map((team) => ({
                    label: team.name,
                    value: team.id,
                }))}
                selectedValues={selectedTeams}
                onChange={(values) => {
                    setSelectedTeams(values);

                    setTaskFormData({
                    ...taskFormData,
                    teamIds: values,
                    });
                }}
                placeholder="Select Teams"
                />
            </div>
          </div>

          {/* Dates */}
          <div className='mt-2'>
            <div className="text-sm text-text-muted mb-2">Schedule</div>
            <div className="flex justify-between text-sm text-text">
              <div>
                <label>Start Date</label>
                <input
                type="date"
                 required
                value={taskFormData.startDate}
                onChange={(e) => {
                  setTaskFormData({...taskFormData, startDate: e.target.value});
                  
                }}
                className="border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
               <div>
                <label>End Date</label>
                <input
                type="date"
                 required
                value={taskFormData.endDate}
                onChange={(e) => {
                  setTaskFormData({...taskFormData, endDate: e.target.value});
                  
                }}
                className="border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
               </div>
              
            </div>
          </div>

          {/* Status */}
          <div className='flex justify-between mt-2'>
            <div>
                 <div className="text-sm text-text-muted mb-2">Status</div>
            <div className="inline-flex items-center w-full bg-surface-alt rounded-full text-sm font-medium text-text">
            <select
             required
              value={taskFormData.status}
              onChange={(e) => setTaskFormData({...taskFormData, status: e.target.value})}
              className="w-full border border-border rounded-lg px-3 py-2 bg-white flex items-center justify-between text-left"
            >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="milestone">Milestone</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            </div>
            
           
          </div>

         
            <div>
              <div className="text-sm text-text-muted mb-2">Description</div>
              <textarea
                className="text-sm w-full text-text border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={taskFormData.description}
                onChange={(e) => {
                 setTaskFormData({...taskFormData, description: e.target.value})
                    // In a real app, this would update the task description in the backend
                }}
              />
            </div>
          

       
            <div>
              <div className="text-sm text-text-muted mb-2">Notes</div>
              <textarea
                className="text-sm w-full text-text border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={taskFormData.notes}
                onChange={(e) => {
                  setTaskFormData({...taskFormData, notes: e.target.value})
                  // In a real app, this would update the task notes in the backend
                }}
              />
            </div>
          

          
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 app-bg-lime app-text-green border border-border rounded-lg text-sm font-medium text-text hover:app-bg-lime/90 transition-colors flex items-center justify-center gap-2"
            >
            
              Save Task
            </button>
         
        </div>
      </div>
    </div>
  );
}

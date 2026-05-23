'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';

import { Card } from '@/components/Card';
import { BarChart3, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ProjectCreateModal from '@/components/ProjectCreateModal';

interface ProjectStats {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
  progress: number;
}

export default function Dashboard() {
  // fetch data
  const [projects, setProjects] = React.useState<ProjectStats[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        fetchProjects();
    }, []);
    
    const fetchProjects = async () => {
      setLoading(true);
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            const formattedProjects = data.map((p: any) => {
              return {
                id: p.id,
                name: p.name,
                color: p.color,
                taskCount: p.tasks.length,
                completedTasks: p.progress === 100 ? 1 : 0,
                inProgressTasks: p.tasks.filter((t: any) => t.status === 'in_progress').length,
                progress: p.progress,
              };
            });
            console.log('Fetched projects:', data);
            setProjects(formattedProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally{
          setLoading(false);
        }
    };
  

  const stats = useMemo(() => {
    return {
      totalProjects: projects.length,
      totalTasks: projects.reduce((acc, p) => acc + p.taskCount, 0),
      completedTasks: projects.reduce((acc, p) => acc + p.completedTasks, 0),
      inProgressTasks: projects.reduce((acc, p) => acc + p.inProgressTasks, 0),
    };
  }, [projects]);

  
  return (
    <div className="flex flex-col h-screen">
      <ProjectCreateModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={(project) => {
            fetchProjects();
            console.log('Created:', project);
        }}
        />
      <TopBar
        title="Dashboard"
        subtitle="Overview of all projects and tasks"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }]}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-bg p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={BarChart3}
              label="Total Projects"
              value={stats.totalProjects}
            />
            <StatCard
              icon={Calendar}
              label="Total Tasks"
              value={stats.totalTasks}
            />
            <StatCard
              icon={Calendar}
              label="In Progress"
              value={stats.inProgressTasks}
              color="orange"
            />
            <StatCard
              icon={Calendar}
              label="Completed"
              value={stats.completedTasks}
              color="green"
            />
          </div>

          {/* Projects List */}
          {!projects.length && (<>
            <p className="text-text-muted">No projects found.</p>
          </>)}

          {loading && (
            <p className="text-text-muted">Loading projects...</p>
          )}
          <div>
            <h2 className="text-xl font-semibold text-text mb-4">Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <a
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="block"
                >
                  <Card
                    hoverable
                    className="p-6 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-4 h-4 rounded-full bg-${project.color}`}
                        />
                        <h3 className="text-lg font-semibold text-text">
                          {project.name}
                        </h3>
                      </div>

                      <div className="flex gap-8 text-sm text-text-muted mb-3">
                        <span>{project.completedTasks} completed</span>
                        <span>{project.inProgressTasks} in progress</span>
                        
                        
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-alt border border-border rounded-full overflow-hidden">
                          <div
                            className={`h-full app-bg-lime`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-text-muted min-w-12 text-right">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-4">
            <button 
            onClick={() => setOpen(true)}
            className="px-6 py-3 app-bg-lime app-text-green rounded-lg font-medium  transition-colors">
              + New Project
            </button>
            <a
              href="/schedule"
              className="px-6 py-3 bg-surface border border-border text-text rounded-lg font-medium hover:bg-surface-alt transition-colors"
            >
              View Full Schedule
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color?: 'orange' | 'green';
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${
            color === 'orange'
              ? 'bg-st-progress-soft'
              : color === 'green'
                ? 'bg-st-done-soft'
                : 'bg-surface-alt'
          }`}
        >
          <Icon
            size={20}
            className={`${
              color === 'orange'
                ? 'text-st-progress'
                : color === 'green'
                  ? 'text-st-done'
                  : 'text-text'
            }`}
          />
        </div>
      </div>
      <div className="text-3xl font-bold text-text">{value}</div>
      <div className="text-sm text-text-muted mt-1">{label}</div>
    </Card>
  );
}

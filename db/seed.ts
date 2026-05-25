import 'dotenv/config';
import { db } from './index';

import {
  projects,
  teams,
  tasks,
  subtasks,
  diaryEntries,
  taskNotifications,
  tasksAssignment,
  subtasksAssignment,
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // =========================
  // PROJECTS
  // =========================
  await db.insert(projects).values([
    {
      id: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      name: 'Residential Building A',
      description: '3-storey residential building with basement parking',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      client: 'John Doe Construction',
      addressLine1: 'Cebu City',
      addressLine2: 'Mandaue City',
      city: 'Cebu City',
      state: 'Cebu',
      zipCode: '6000',
      color: 'p1',
      progress: '30.00',
    },
    {
      id: 'f3a1c9b0-1e2d-4c55-9a1b-100000000002',
      name: 'Commercial Office Tower',
      description: '12-floor office building project',
      status: 'active',
      startDate: '2026-02-01',
      endDate: '2026-10-30',
      client: 'ABC Holdings',
      addressLine1: 'Mandaue City',
      addressLine2: 'Cebu City',
      city: 'Cebu City',
      state: 'Cebu',
      zipCode: '6000',
      color: 'p2',
      progress: '15.00',
    },
  ]);

  // =========================
  // TEAMS
  // =========================
  await db.insert(teams).values([
    {
      id: 'a9d1b2c3-4e5f-4a11-9000-200000000001',
      name: 'Electrical Team',
      description: 'Handles all electrical installations',
      contactName: 'Mark Santos',
      contactPhone: '09171234567',
      contactEmail: 'electrical@buildpro.com',
    },
    {
      id: 'a9d1b2c3-4e5f-4a11-9000-200000000002',
      name: 'Plumbing Team',
      description: 'Water supply and drainage systems',
      contactName: 'Anna Reyes',
      contactPhone: '09179876543',
      contactEmail: 'plumbing@buildpro.com',
    },
    {
      id: 'a9d1b2c3-4e5f-4a11-9000-200000000003',
      name: 'Structural Team',
      description: 'Concrete and steel works',
      contactName: 'Carlos Lim',
      contactPhone: '09175551234',
      contactEmail: 'structural@buildpro.com',
    },
  ]);

  // =========================
  // TASKS
  // =========================
  await db.insert(tasks).values([
    {
      id: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      name: 'Electrical Rough-In',
      description: 'Install conduits and wiring',
      status: 'in_progress',
      startDate: '2026-05-01',
      endDate: '2026-05-20',
      estimatedDays: 20,
      notes: 'Follow electrical safety standards',
      isMilestone: false,
      sortOrder: 1,
    },
    {
      id: 'b7c2d1e3-9a11-4b22-8000-300000000002',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      name: 'Plumbing Installation',
      description: 'Install pipes and drainage system',
      status: 'planned',
      startDate: '2026-05-10',
      endDate: '2026-06-01',
      estimatedDays: 22,
      notes: 'Pressure testing required',
      isMilestone: false,
      sortOrder: 2,
    },
    {
      id: 'b7c2d1e3-9a11-4b22-8000-300000000003',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000002',
      name: 'Structural Framework',
      description: 'Steel framing and concrete works',
      status: 'done',
      startDate: '2026-03-01',
      endDate: '2026-04-30',
      estimatedDays: 60,
      notes: 'Critical milestone phase',
      isMilestone: true,
      sortOrder: 1,
    },
     {
      id: 'b7c2d1e3-9a11-4b22-8000-300000000004',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000002',
      name: 'Structural Framework',
      description: 'Steel framing and concrete works',
      status: 'blocked',
      startDate: '2026-05-21',
      endDate: '2026-06-30',
      estimatedDays: 60,
      notes: 'Critical milestone phase blocked',
      isMilestone: true,
      sortOrder: 1,
    },
  ]);


  await db.insert(tasksAssignment).values([
    {
      id: 'f8a3e334-0b15-4f8e-b930-2cb2633f7ea7',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      taskId: 'c3333333-3333-3333-3333-333333333333',
      teamId: 'a9d1b2c3-4e5f-4a11-9000-200000000001',
    },
    {
      id: 'afbdd29f-e490-4801-9a78-14c8ad2fd9f2',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      taskId: 'c3333333-3333-3333-3333-333333333333',
      teamId: 'b2222222-2222-2222-2222-222222222222',
    },
    {
      id: '8e1b48c1-6739-49bf-8cd3-15805b3f1ce1',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      taskId: 'c3333333-3333-3333-3333-333333333333',
      teamId: 'b3333333-3333-3333-3333-333333333333',
    },
    
  ]);

  await db.insert(subtasksAssignment).values([
    {
      id: 'f8a3e334-0b15-4f8e-b930-2cb2633f7ea7',
      subtaskId: 'c1d2e3f4-1111-4aaa-9000-400000000001',
      parent_TaskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      teamId: 'a9d1b2c3-4e5f-4a11-9000-200000000001',
    },
    {
      id: 'afbdd29f-e490-4801-9a78-14c8ad2fd9f2',
      subtaskId: 'c1d2e3f4-1111-4aaa-9000-400000000001',
      parent_TaskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      teamId: 'b2222222-2222-2222-2222-222222222222',
    },
    {
      id: '8e1b48c1-6739-49bf-8cd3-15805b3f1ce1',
      subtaskId: 'c1d2e3f4-1111-4aaa-9000-400000000001',
      parent_TaskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      projectId: 'a1111111-1111-1111-1111-111111111111',
      teamId: 'b3333333-3333-3333-3333-333333333333',
    },
    
  ]);

  // =========================
  // SUBTASKS
  // =========================
  await db.insert(subtasks).values([
    {
      id: 'c1d2e3f4-1111-4aaa-9000-400000000001',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      name: 'Install Electrical Panels',
      description: 'Main panel installation',
      status: 'in_progress',
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      sortOrder: 1,
    },
    {
      id: 'c1d2e3f4-1111-4aaa-9000-400000000002',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      name: 'Wiring Layout',
      description: 'Route electrical wiring',
      status: 'planned',
      startDate: '2026-05-06',
      endDate: '2026-05-15',
      sortOrder: 2,
    },
    {
      id: 'c1d2e3f4-1111-4aaa-9000-400000000003',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      name: 'Wiring Layout 2',
      description: 'Route electrical wiring',
      status: 'done',
      startDate: '2026-05-06',
      endDate: '2026-05-15',
      sortOrder: 2,
    },
     {
      id: 'c1d2e3f4-1111-4aaa-9000-400000000004',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      name: 'Wiring Layout 3',
      description: 'Route electrical wiring',
      status: 'blocked',
      startDate: '2026-05-30',
      endDate: '2026-06-15',
      sortOrder: 3,
    },
  ]);

  // =========================
  // DIARY ENTRIES
  // =========================
  await db.insert(diaryEntries).values([
    {
      id: 'd9e1f2a3-2222-4bbb-8000-500000000001',
      projectId: 'f3a1c9b0-1e2d-4c55-9a1b-100000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      entryDate: '2026-05-21',
      title: 'Electrical Progress Update',
      notes: 'Wiring installation is 40% complete',
      photos: [],
      status: 'published',
    },
  ]);

  // =========================
  // TASK NOTIFICATIONS
  // =========================
  await db.insert(taskNotifications).values([
    {
      id: 'e1f2a3b4-3333-4ccc-7000-600000000001',
      taskId: 'b7c2d1e3-9a11-4b22-8000-300000000001',
      teamId: 'a9d1b2c3-4e5f-4a11-9000-200000000001',
      status: 'sent',
      message: 'Electrical task is due for inspection',
      sentAt: new Date(),
      failureReason: null,
      metadata: {
        priority: 'high',
        channel: 'email',
      },
    },
  ]);

  console.log('✅ Seeding completed successfully');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
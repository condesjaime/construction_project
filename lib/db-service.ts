import { db } from '@/db';
import { NewProject, projects, tasks, subtasks, diaryEntries, taskNotifications, teams } from '@/db/schema';
import { eq, desc, and, between, gte, lte } from 'drizzle-orm';


// Projects
export async function getProjects() {
  return db.query.projects.findMany({
    with: {
      tasks: true,
    },
  });
}

export async function getProjectById(id: string) {
  return db.query.projects.findFirst({
     where: eq(projects.id, id)
      // with: {
      //   tasks: {
      //     with: {
      //       team: true,
      //       subtasks: true,
      //     },
      //   },
      //   diaryEntries: true,
      // },
  });
}

export async function createProject(data: NewProject) {
  const values: NewProject = {
    name: data.name,
    description: data.description,
    status: data.status || 'active',
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    client: data.client,
    location: data.location,
    color: data.color || 'p1',
    progress: data.progress || '0.00',
  };

  const result = await db
    .insert(projects)
    .values(values)
    .returning();

  return result[0];
}

export async function updateProject(id: string, data: Partial<{
  name: string;
  description?: string;
  client?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  color?: string;
  status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
}>) {
  const result = await db
    .update(projects)
    .set({
      ...data,
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  return result[0];
}


// Tasks
export async function getTasks(filters?: {
  projectId?: string;
  teamId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
}) {
  const conditions = [];
  
  if (filters?.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters?.teamId) {
    conditions.push(eq(tasks.teamId, filters.teamId));
  }
  
  return db.query.tasks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      project: true,
      team: true,
      subtasks: true,
    },
  });
}

export async function createTask(data: any) {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const result = await db.insert(tasks).values({
    projectId: data.projectId,
    teamId: data.teamId,
    name: data.name,
    description: data.description,
    status: data.status || 'planned',

    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],

    estimatedDays: data.estimatedDays,
    notes: data.notes,
    isMilestone: data.isMilestone || false,
    sortOrder: data.sortOrder || 0,
  }).returning();

  return result[0];
}

export async function updateTask(
  id: string,
  data: Partial<{
    projectId?: string;
    teamId?: string;
    name?: string;
    description?: string;
    status?: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
    startDate?: string;
    endDate?: string;
    estimatedDays?: number;
    notes?: string;
    isMilestone?: boolean;
  }>
) {
  const updateData: any = {};

  if (data.projectId !== undefined)
    updateData.projectId = data.projectId;

  if (data.teamId !== undefined)
    updateData.teamId = data.teamId;

  if (data.name !== undefined)
    updateData.name = data.name;

  if (data.description !== undefined)
    updateData.description = data.description;

  if (data.status !== undefined)
    updateData.status = data.status;

  if (data.startDate !== undefined) {
    updateData.startDate = new Date(data.startDate)
      .toISOString()
      .split('T')[0];
  }

  if (data.endDate !== undefined) {
    updateData.endDate = new Date(data.endDate)
      .toISOString()
      .split('T')[0];
  }

  if (data.estimatedDays !== undefined)
    updateData.estimatedDays = data.estimatedDays;

  if (data.notes !== undefined)
    updateData.notes = data.notes;

  if (data.isMilestone !== undefined)
    updateData.isMilestone = data.isMilestone;

  updateData.updatedAt = new Date();

  const result = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();

  return result[0];
}

export async function deleteTask(id: string) {
  return db.delete(tasks).where(eq(tasks.id, id));
}

// Subtasks
export async function createSubtask(data: {
  taskId: string;
  name: string;
  description?: string;
  status?: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
  startDate: Date;
  endDate: Date;
}) {
  const result = await db.insert(subtasks).values({
    taskId: data.taskId,
    name: data.name,
    description: data.description,
    status: data.status || 'planned',
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
  }).returning();
  return result[0];
}

export async function updateSubtask(id: string, data: Partial<{
  taskId?: string;
  name?: string;
  description?: string;
  status?: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
  startDate?: Date;
  endDate?: Date;
}>) {
  const updateData: any = {};
  if (data.taskId !== undefined) updateData.taskId = data.taskId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = data.startDate.toISOString();
  if (data.endDate !== undefined) updateData.endDate = data.endDate.toISOString();
  updateData.updatedAt = new Date();

  const result = await db
    .update(subtasks)
    .set(updateData)
    .where(eq(subtasks.id, id))
    .returning();
  return result[0];
}

// Diary Entries
export async function getDiaryEntries(projectId: string) {
  return db.query.diaryEntries.findMany({
    where: eq(diaryEntries.projectId, projectId),
    with: {
      project: true,
      task: true
    },
    orderBy: desc(diaryEntries.entryDate),
  });
}

export async function getDiaryEntriesAll() {
  return db.query.diaryEntries.findMany({
    with: {
      project: true,
      task: true,
    },
    orderBy: desc(diaryEntries.entryDate),
  });
}

export async function createDiaryEntry(data: {
  projectId: string;
  taskId?: string;
  taskName?: string;
  date?: Date;
  title?: string;
  notes?: string;
  photos?: string[];
  status?: 'draft' | 'published';
}) {

    const enDate = data.date
    ? new Date(data.date)
    : new Date();
    const formattedDate = enDate.toISOString().split('T')[0];
  const result = await db.insert(diaryEntries).values({
    projectId: data.projectId,
    taskId: data.taskId!,
    entryDate: formattedDate,
    title: data.title,
    notes: data.notes,
    photos: data.photos || [],
    status: data.status || 'draft',
  }).returning();
  return result[0];
}

export async function updateDiaryEntry(id: string, data: Partial<{
  projectId?: string;
  taskId?: string;
  entryDate?: Date;
  title?: string;
  notes?: string;
  status?: 'draft' | 'published';
  photos?: string[];
}>) {
  const updateData: any = {};
  if (data.projectId !== undefined) updateData.projectId = data.projectId;
  if (data.taskId !== undefined) updateData.taskId = data.taskId;
  if (data.entryDate !== undefined) updateData.entryDate = data.entryDate.toISOString();
  if (data.title !== undefined) updateData.title = data.title;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.photos !== undefined) updateData.photos = data.photos;
  updateData.updatedAt = new Date();

  const result = await db
    .update(diaryEntries)
    .set(updateData)
    .where(eq(diaryEntries.id, id))
    .returning();
  return result[0];
}

export async function deleteDiaryEntry(id: string) {
  return db.delete(diaryEntries).where(eq(diaryEntries.id, id));
}

// Task Notifications
export async function createNotification(data: {
  taskId: string;
  teamId: string;
  message: string;
  metadata?: any;
}) {
  const result = await db.insert(taskNotifications).values(data).returning();
  return result[0];
}

export async function updateNotificationStatus(
  id: string,
  status: 'sent' | 'failed',
  failureReason?: string
) {
  const result = await db
    .update(taskNotifications)
    .set({
      status,
      failureReason,
      sentAt: new Date(),
    })
    .where(eq(taskNotifications.id, id))
    .returning();
  return result[0];
}

export async function getNotifications(filters?: {
  status?: string;
  taskId?: string;
}) {
  return db.query.taskNotifications.findMany({
    where: filters?.taskId ? eq(taskNotifications.taskId, filters.taskId) : undefined,
    with: {
      task: true,
      team: true,
    },
    orderBy: desc(taskNotifications.createdAt),
  });
}

// Teams
export async function getTeams() {
  return db.query.teams.findMany({
    with: {
      tasks: true,
    },
  });
}

export async function getTeamsById(id : string) {
  return db.query.teams.findFirst({
    where: eq(teams.id, id)
  });
}
export async function createTeam(data: {
  name: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}) {
  const result = await db.insert(teams).values(data).returning();
  return result[0];
}

export async function updateTeam(id: string, data: Partial<{
  name?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}>) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  updateData.updatedAt = new Date();
  const result = await db
    .update(teams)
    .set(updateData)
    .where(eq(teams.id, id))
    .returning();
  return result[0];
}
export async function deleteTeam(id: string) {
  return db.delete(teams).where(eq(teams.id, id));
}

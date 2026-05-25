import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  pgEnum,
  boolean,
  date,
  jsonb,
  decimal,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const taskStatusEnum = pgEnum('task_status', [
  'planned',
  'in_progress',
  'done',
  'milestone',
  'blocked',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'blocked',
]);

export const userLevelEnum = pgEnum('user_level', [
  'basic',
  'manager',
  'admin',
]);

export const entryStatusEnum = pgEnum('entry_status', [
  'draft',
  'published',
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'sent',
  'failed',
]);

// Tables
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    client: varchar('client', { length: 255 }),
    addressLine1: varchar('address_line1', { length: 255 }),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 255 }),
    state: varchar('state', { length: 255 }),
    zipCode: varchar('zip_code', { length: 20 }),
    color: varchar('color', { length: 50 }).default('p1'),
    progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    statusIdx: index('projects_status_idx').on(table.status),
    createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
  })
);

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    contactName: varchar('contact_name', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 20 }),
    contactEmail: varchar('contact_email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }
);
export const tasksAssignment = pgTable(
  'tasks_assignment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdIdx: index('tasks_assignment_project_id_idx').on(table.projectId),
    teamIdIdx: index('tasks_assignment_team_id_idx').on(table.teamId),
    tasksIdx: index('tasks_assignment_task_id_idx').on(table.taskId),
  })
);

export const subtasksAssignment = pgTable(
  'subtasks_assignment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subtaskId: uuid('subtask_id')
      .notNull()
      .references(() => subtasks.id, { onDelete: 'cascade' }),
    parent_TaskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdIdx: index('subtasks_assignment_project_id_idx').on(table.projectId),
    teamIdIdx: index('subtasks_assignment_team_id_idx').on(table.teamId),
    subtasksIdx: index('subtasks_assignment_subtask_id_idx').on(table.subtaskId),
    parentTasksIdx: index('subtasks_assignment_parent_task_id_idx').on(table.parent_TaskId),
  })
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('planned'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    estimatedDays: integer('estimated_days'),
    notes: text('notes'),
    isMilestone: boolean('is_milestone').default(false),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
    dateRangeIdx: index('tasks_date_range_idx').on(table.startDate, table.endDate),
  })
);

export const subtasks = pgTable(
  'subtasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('planned'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    estimatedDays: integer('estimated_days'),
    notes: text('notes'),
    isMilestone: boolean('is_milestone').default(false),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    taskIdIdx: index('subtasks_task_id_idx').on(table.taskId),
    projectIdIdx: index('subtasks_project_id_idx').on(table.projectId),
  })
);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  fullName: varchar('full_name', { length: 255 }).notNull(),
  
  email: varchar('email', { length: 255 }).notNull().unique(),
  
  passwordHash: text('password_hash').notNull(),

  passwordSalt: text('password_salt').notNull(),
  userLevel: userLevelEnum('user_level').notNull().default('basic'),
  status: userStatusEnum('status')
    .notNull()
    .default('active'),

  mustChangePassword: boolean('must_change_password')
    .notNull()
    .default(false),

  passwordResetToken: text('password_reset_token'),

  passwordResetExpiresAt: timestamp(
    'password_reset_expires_at'
  ),

  lastPasswordChangedAt: timestamp(
    'last_password_changed_at'
  ),

  createdAt: timestamp('created_at').defaultNow(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const diaryEntries = pgTable(
  'diary_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'set null' }),
    subtaskId: uuid('subtask_id')
      .references(() => subtasks.id, { onDelete: 'set null' }),  
    entryDate: date('entry_date').notNull(),
    title: varchar('title', { length: 255 }),
    createdBy: uuid('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    photos: jsonb('photos').$type<string[]>().default([]), // JSON stringified array of photo URLs
    videos: jsonb('videos').$type<string[]>().default([]), // JSON stringified array of video URLs
    status: entryStatusEnum('status').notNull().default('published'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdIdx: index('diary_entries_project_id_idx').on(table.projectId),
    entryDateIdx: index('diary_entries_date_idx').on(table.entryDate),
    userIdx: index('user_id_idx').on(table.createdBy),
  })
);


export const taskNotifications = pgTable(
  'task_notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'restrict' }),
    status: notificationStatusEnum('status').notNull().default('pending'),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at'),
    failureReason: text('failure_reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    taskIdIdx: index('notifications_task_id_idx').on(table.taskId),
    statusIdx: index('notifications_status_idx').on(table.status),
  })
);

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  diaryEntries: many(diaryEntries),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  tasks: many(tasks),
  notifications: many(taskNotifications),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  team_assignment: many(tasksAssignment),
  subtasks: many(subtasks),
  diaryEntries: many(diaryEntries),
  notifications: many(taskNotifications),
}));

export const tasksAssignmentRelations = relations(tasksAssignment, ({ one }) => ({
  task: one(tasks, {
    fields: [tasksAssignment.taskId],
    references: [tasks.id],
  }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const diaryEntriesRelations = relations(
  diaryEntries,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [diaryEntries.projectId],
      references: [projects.id],
    }),
    task: one(tasks, {
      fields: [diaryEntries.taskId],
      references: [tasks.id],
    }),
    users: one(users, {
      fields: [diaryEntries.createdBy],
      references: [users.id],
    }),
  })
);



export const taskNotificationsRelations = relations(
  taskNotifications,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskNotifications.taskId],
      references: [tasks.id],
    }),
    team: one(teams, {
      fields: [taskNotifications.teamId],
      references: [teams.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Subtask = typeof subtasks.$inferSelect;
export type NewSubtask = typeof subtasks.$inferInsert;

export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type NewDiaryEntry = typeof diaryEntries.$inferInsert;

export type TaskNotification = typeof taskNotifications.$inferSelect;
export type NewTaskNotification = typeof taskNotifications.$inferInsert;

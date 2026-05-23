CREATE TYPE "public"."entry_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('planned', 'in_progress', 'done', 'milestone', 'blocked');--> statement-breakpoint
CREATE TABLE "diary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"task_id" uuid,
	"entry_date" date NOT NULL,
	"title" varchar(255),
	"notes" text,
	"photos" text,
	"status" "entry_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diary_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"file_name" varchar(255),
	"file_size" integer,
	"mime_type" varchar(100),
	"caption" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"start_date" date,
	"end_date" date,
	"client" varchar(255),
	"location" varchar(255),
	"color" varchar(50) DEFAULT 'p1',
	"progress" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'planned' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'planned' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"estimated_days" integer,
	"notes" text,
	"is_milestone" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"contact_name" varchar(255),
	"contact_phone" varchar(20),
	"contact_email" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_media" ADD CONSTRAINT "diary_media_entry_id_diary_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_notifications" ADD CONSTRAINT "task_notifications_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_notifications" ADD CONSTRAINT "task_notifications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diary_entries_project_id_idx" ON "diary_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "diary_entries_date_idx" ON "diary_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "diary_media_entry_id_idx" ON "diary_media" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subtasks_task_id_idx" ON "subtasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "notifications_task_id_idx" ON "task_notifications" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "task_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_team_id_idx" ON "tasks" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "tasks_date_range_idx" ON "tasks" USING btree ("start_date","end_date");
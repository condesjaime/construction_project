CREATE TABLE "subtasks_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subtask_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "address" TO "address_line1";--> statement-breakpoint
ALTER TABLE "subtasks" RENAME COLUMN "team_id" TO "estimated_days";--> statement-breakpoint
ALTER TABLE "subtasks" DROP CONSTRAINT "subtasks_team_id_teams_id_fk";
--> statement-breakpoint
DROP INDEX "subtasks_team_id_idx";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "address_line2" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "city" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "state" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "zip_code" varchar(20);--> statement-breakpoint
ALTER TABLE "subtasks" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "subtasks" ADD COLUMN "is_milestone" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subtasks_assignment" ADD CONSTRAINT "subtasks_assignment_subtask_id_subtasks_id_fk" FOREIGN KEY ("subtask_id") REFERENCES "public"."subtasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks_assignment" ADD CONSTRAINT "subtasks_assignment_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks_assignment" ADD CONSTRAINT "subtasks_assignment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks_assignment" ADD CONSTRAINT "subtasks_assignment_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subtasks_assignment_project_id_idx" ON "subtasks_assignment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "subtasks_assignment_team_id_idx" ON "subtasks_assignment" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "subtasks_assignment_subtask_id_idx" ON "subtasks_assignment" USING btree ("subtask_id");--> statement-breakpoint
CREATE INDEX "subtasks_assignment_parent_task_id_idx" ON "subtasks_assignment" USING btree ("task_id");
CREATE TABLE "tasks_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "location" TO "address";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_team_id_teams_id_fk";
--> statement-breakpoint
DROP INDEX "tasks_team_id_idx";--> statement-breakpoint
ALTER TABLE "tasks_assignment" ADD CONSTRAINT "tasks_assignment_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignment" ADD CONSTRAINT "tasks_assignment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_assignment" ADD CONSTRAINT "tasks_assignment_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_assignment_project_id_idx" ON "tasks_assignment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_assignment_team_id_idx" ON "tasks_assignment" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "tasks_assignment_task_id_idx" ON "tasks_assignment" USING btree ("task_id");--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "team_id";
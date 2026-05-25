ALTER TABLE "subtasks" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subtasks_project_id_idx" ON "subtasks" USING btree ("project_id");
ALTER TABLE "diary_entries" ADD COLUMN "subtask_id" uuid;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "videos" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "subtasks" ADD COLUMN "team_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_subtask_id_subtasks_id_fk" FOREIGN KEY ("subtask_id") REFERENCES "public"."subtasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subtasks_team_id_idx" ON "subtasks" USING btree ("team_id");
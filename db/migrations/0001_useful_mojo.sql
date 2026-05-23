ALTER TABLE "diary_media" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "diary_media" CASCADE;--> statement-breakpoint
ALTER TABLE "diary_entries" ALTER COLUMN "task_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "diary_entries" ALTER COLUMN "photos" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "diary_entries" ALTER COLUMN "photos" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;
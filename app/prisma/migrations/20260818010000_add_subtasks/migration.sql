-- AlterTable
ALTER TABLE "Habit" ADD COLUMN "subtasks" JSONB;
ALTER TABLE "HabitLog" ADD COLUMN "subtasksDone" JSONB;

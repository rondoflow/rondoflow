-- Rename ScheduledTask.maestroEnabled -> directorEnabled (Maestro feature renamed to Director)
ALTER TABLE "ScheduledTask" RENAME COLUMN "maestroEnabled" TO "directorEnabled";

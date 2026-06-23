-- Add 'custom' to SkillSource so users can create hand-authored local skills.
ALTER TYPE "SkillSource" ADD VALUE IF NOT EXISTS 'custom';

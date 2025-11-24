-- Rename assigned_games column to assigned_activities in waiver_templates table
ALTER TABLE IF EXISTS waiver_templates RENAME COLUMN assigned_games TO assigned_activities;

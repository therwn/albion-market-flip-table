-- Migration: Add table_name column to tables
-- Run this in Supabase SQL Editor

ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS table_name TEXT;

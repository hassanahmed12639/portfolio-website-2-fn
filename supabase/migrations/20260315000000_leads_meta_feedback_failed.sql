-- Add meta_feedback_failed for Lead Manager status badge (Failed)
alter table leads add column if not exists meta_feedback_failed boolean default false;

-- Allow 'lost' in stage (UI already has this option)
alter table leads drop constraint if exists leads_stage_check;
alter table leads add constraint leads_stage_check check (stage in ('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'));

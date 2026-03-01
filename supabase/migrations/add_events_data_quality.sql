-- Data Quality columns for CAPI events
alter table events add column if not exists data_quality_score int default 0;
alter table events add column if not exists data_quality_label text default 'Poor';
alter table events add column if not exists data_quality_breakdown jsonb default '{}';

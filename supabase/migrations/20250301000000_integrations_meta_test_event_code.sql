-- Meta CAPI test event code (optional, for Test Events in Events Manager)
alter table integrations add column if not exists meta_test_event_code text;

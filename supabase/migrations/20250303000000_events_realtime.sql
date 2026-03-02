-- Enable Supabase Realtime for the events table so the Live Event Stream dashboard can subscribe to new events.
-- Run this in Supabase SQL Editor if not using migrations: alter publication supabase_realtime add table events;
alter publication supabase_realtime add table events;

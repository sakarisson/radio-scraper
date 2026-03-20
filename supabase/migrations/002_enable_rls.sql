-- Enable Row Level Security on all public tables and add read-only public
-- access policies. The scraper and web-ui both use the service_role key,
-- which bypasses RLS, so this change only locks down the anon/public API.

-- Step 1: Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_play_data ENABLE ROW LEVEL SECURITY;

-- Step 2: Allow anonymous read access (public historical record)
CREATE POLICY "Allow public read access" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON plays FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON raw_play_data FOR SELECT USING (true);

-- Step 3: Fix mutable search_path warning on reset_sequence
ALTER FUNCTION reset_sequence(text) SET search_path = public;

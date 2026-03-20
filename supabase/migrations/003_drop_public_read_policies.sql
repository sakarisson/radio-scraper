-- Remove public read policies. The data is valuable and should not be
-- accessible via the anon/public key. Both the scraper and web-ui use
-- the service_role key, which bypasses RLS.

DROP POLICY "Allow public read access" ON artists;
DROP POLICY "Allow public read access" ON songs;
DROP POLICY "Allow public read access" ON stations;
DROP POLICY "Allow public read access" ON plays;
DROP POLICY "Allow public read access" ON raw_play_data;

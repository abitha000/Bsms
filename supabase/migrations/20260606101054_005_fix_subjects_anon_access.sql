-- Drop duplicate policy
DROP POLICY IF EXISTS "subjects_select_all" ON subjects;

-- Allow anonymous access to subjects for initial display
CREATE POLICY "subjects_select_public" ON subjects FOR SELECT TO anon USING (true);
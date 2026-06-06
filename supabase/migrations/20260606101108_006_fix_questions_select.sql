-- Fix questions SELECT policy - allow authenticated users to read all questions
DROP POLICY IF EXISTS "questions_select_own" ON questions;
CREATE POLICY "questions_select_authenticated" ON questions FOR SELECT TO authenticated USING (true);

-- Also allow anon to read questions
CREATE POLICY "questions_select_anon" ON questions FOR SELECT TO anon USING (true);
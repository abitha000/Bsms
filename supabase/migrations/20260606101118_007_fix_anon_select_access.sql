-- Allow anonymous access to read medicines
CREATE POLICY "medicines_select_anon" ON medicines FOR SELECT TO anon USING (true);

-- Allow anonymous access to read previous_papers
CREATE POLICY "previous_papers_select_anon" ON previous_papers FOR SELECT TO anon USING (true);

-- Allow anonymous access to read paper_questions
CREATE POLICY "paper_questions_select_anon" ON paper_questions FOR SELECT TO anon USING (true);
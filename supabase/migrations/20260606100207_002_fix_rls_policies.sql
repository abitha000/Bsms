-- Fix RLS policies that were using `true` which bypasses security

-- Drop the insecure policies first
DROP POLICY IF EXISTS "subjects_insert_authenticated" ON subjects;
DROP POLICY IF EXISTS "subjects_update_authenticated" ON subjects;
DROP POLICY IF EXISTS "subjects_delete_authenticated" ON subjects;

DROP POLICY IF EXISTS "questions_insert_own" ON questions;
DROP POLICY IF EXISTS "questions_update_own" ON questions;
DROP POLICY IF EXISTS "questions_delete_own" ON questions;

DROP POLICY IF EXISTS "previous_papers_insert_own" ON previous_papers;
DROP POLICY IF EXISTS "previous_papers_delete_own" ON previous_papers;

DROP POLICY IF EXISTS "paper_questions_insert_own" ON paper_questions;
DROP POLICY IF EXISTS "paper_questions_delete_own" ON paper_questions;

-- Subjects: These are reference data - only allow SELECT for authenticated users
-- No INSERT/UPDATE/DELETE for authenticated users (only service role can modify)
CREATE POLICY "subjects_select_authenticated" ON subjects FOR SELECT TO authenticated USING (true);

-- Questions: User can only modify questions from their own documents
CREATE POLICY "questions_insert_own" ON questions FOR INSERT TO authenticated
  WITH CHECK (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "questions_update_own" ON questions FOR UPDATE TO authenticated
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "questions_delete_own" ON questions FOR DELETE TO authenticated
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- Previous papers: User can only modify papers linked to their own documents
CREATE POLICY "previous_papers_insert_own" ON previous_papers FOR INSERT TO authenticated
  WITH CHECK (document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "previous_papers_delete_own" ON previous_papers FOR DELETE TO authenticated
  USING (document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- Paper questions: User can only modify if the paper belongs to their documents
CREATE POLICY "paper_questions_insert_own" ON paper_questions FOR INSERT TO authenticated
  WITH CHECK (paper_id IN (SELECT id FROM previous_papers WHERE document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())));
CREATE POLICY "paper_questions_delete_own" ON paper_questions FOR DELETE TO authenticated
  USING (paper_id IN (SELECT id FROM previous_papers WHERE document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())));
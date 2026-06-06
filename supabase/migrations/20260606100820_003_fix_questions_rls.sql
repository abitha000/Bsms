-- Fix RLS policies for questions to allow null document_id

DROP POLICY IF EXISTS "questions_insert_own" ON questions;
DROP POLICY IF EXISTS "questions_update_own" ON questions;
DROP POLICY IF EXISTS "questions_delete_own" ON questions;

-- Questions: User can insert/update/delete questions if document_id is null OR belongs to their documents
CREATE POLICY "questions_insert_own" ON questions FOR INSERT TO authenticated
  WITH CHECK (document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "questions_update_own" ON questions FOR UPDATE TO authenticated
  USING (document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "questions_delete_own" ON questions FOR DELETE TO authenticated
  USING (document_id IS NULL OR document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
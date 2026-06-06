-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_tamil VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('siddha', 'modern', 'research')),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('textbook', 'notes', 'guide', 'model_answer', 'question_paper', 'internal_medicine', 'pediatrics', 'obg', 'surgery', 'research_notes')),
  language VARCHAR(20) DEFAULT 'tamil' CHECK (language IN ('tamil', 'english', 'bilingual')),
  file_url TEXT NOT NULL,
  file_size INT,
  page_count INT,
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_number INT,
  title VARCHAR(500) NOT NULL,
  title_tamil VARCHAR(500),
  start_page INT,
  end_page INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content chunks for storage
CREATE TABLE content_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_tamil TEXT,
  content_english TEXT,
  page_number INT,
  chunk_index INT,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'medicine', 'definition', 'classification', 'treatment', 'symptom', 'diagnosis')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines table (critical for exact extraction)
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_tamil VARCHAR(255),
  category VARCHAR(100),
  dosage VARCHAR(255),
  dosage_tamil VARCHAR(255),
  indications TEXT,
  contraindications TEXT,
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  source_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  source_page INT,
  source_book_name VARCHAR(500),
  preparation_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('one_mark', 'five_mark', 'ten_mark')),
  question_text TEXT NOT NULL,
  question_tamil TEXT,
  answer TEXT,
  answer_tamil TEXT,
  answer_english TEXT,
  keywords TEXT[],
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  frequency_count INT DEFAULT 0,
  last_asked_year INT,
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  source_page INT,
  source_chapter VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous year papers
CREATE TABLE previous_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INT NOT NULL,
  month VARCHAR(20),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  total_questions INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper questions mapping
CREATE TABLE paper_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID REFERENCES previous_papers(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  question_number INT,
  marks INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  one_mark_completed INT DEFAULT 0,
  five_mark_completed INT DEFAULT 0,
  ten_mark_completed INT DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- Revision items
CREATE TABLE revision_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  revision_count INT DEFAULT 0,
  last_revised_at TIMESTAMPTZ,
  next_revision_date TIMESTAMPTZ,
  confidence_level INT DEFAULT 0 CHECK (confidence_level BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects (public read, authenticated write)
CREATE POLICY "subjects_select_all" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "subjects_insert_authenticated" ON subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subjects_update_authenticated" ON subjects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "subjects_delete_authenticated" ON subjects FOR DELETE TO authenticated USING (true);

-- RLS Policies for documents (user owns their documents)
CREATE POLICY "documents_select_own" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_insert_own" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update_own" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "documents_delete_own" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for chapters
CREATE POLICY "chapters_select_own" ON chapters FOR SELECT TO authenticated 
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "chapters_insert_own" ON chapters FOR INSERT TO authenticated 
  WITH CHECK (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "chapters_update_own" ON chapters FOR UPDATE TO authenticated 
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "chapters_delete_own" ON chapters FOR DELETE TO authenticated 
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- RLS Policies for content_chunks
CREATE POLICY "content_chunks_select_own" ON content_chunks FOR SELECT TO authenticated 
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "content_chunks_insert_own" ON content_chunks FOR INSERT TO authenticated 
  WITH CHECK (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "content_chunks_delete_own" ON content_chunks FOR DELETE TO authenticated 
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- RLS Policies for medicines
CREATE POLICY "medicines_select_own" ON medicines FOR SELECT TO authenticated 
  USING (source_document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "medicines_insert_own" ON medicines FOR INSERT TO authenticated 
  WITH CHECK (source_document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "medicines_update_own" ON medicines FOR UPDATE TO authenticated 
  USING (source_document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
CREATE POLICY "medicines_delete_own" ON medicines FOR DELETE TO authenticated 
  USING (source_document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- RLS Policies for questions
CREATE POLICY "questions_select_own" ON questions FOR SELECT TO authenticated 
  USING (subject_id IN (SELECT id FROM subjects WHERE id = subject_id));
CREATE POLICY "questions_insert_own" ON questions FOR INSERT TO authenticated 
  WITH CHECK (true);
CREATE POLICY "questions_update_own" ON questions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "questions_delete_own" ON questions FOR DELETE TO authenticated USING (true);

-- RLS Policies for previous_papers
CREATE POLICY "previous_papers_select_own" ON previous_papers FOR SELECT TO authenticated 
  USING (true);
CREATE POLICY "previous_papers_insert_own" ON previous_papers FOR INSERT TO authenticated 
  WITH CHECK (true);
CREATE POLICY "previous_papers_delete_own" ON previous_papers FOR DELETE TO authenticated 
  USING (true);

-- RLS Policies for paper_questions
CREATE POLICY "paper_questions_select_own" ON paper_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "paper_questions_insert_own" ON paper_questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "paper_questions_delete_own" ON paper_questions FOR DELETE TO authenticated USING (true);

-- RLS Policies for user_progress
CREATE POLICY "user_progress_select_own" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_progress_insert_own" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_update_own" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for revision_items
CREATE POLICY "revision_items_select_own" ON revision_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "revision_items_insert_own" ON revision_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "revision_items_update_own" ON revision_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "revision_items_delete_own" ON revision_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_subject ON documents(subject_id);
CREATE INDEX idx_chapters_document ON chapters(document_id);
CREATE INDEX idx_content_chunks_document ON content_chunks(document_id);
CREATE INDEX idx_content_chunks_chapter ON content_chunks(chapter_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_revision_items_user ON revision_items(user_id);

-- Insert default subjects
INSERT INTO subjects (name, name_tamil, category, description, icon, color, sort_order) VALUES
('Maruthuvam', 'மருத்துவம்', 'siddha', 'General Medicine in Siddha', 'stethoscope', '#10b981', 1),
('Sirappu Maruthuvam', 'சிறப்பு மருத்துவம்', 'siddha', 'Special Medicine in Siddha', 'heart-pulse', '#f59e0b', 2),
('Kuzhanthai Maruthuvam', 'குழந்தை மருத்துவம்', 'siddha', 'Pediatrics in Siddha', 'baby', '#ec4899', 3),
('Sool & Magalir Maruthuvam', 'சூல் மற்றும் மகளிர் மருத்துவம்', 'siddha', 'Obstetrics & Gynecology in Siddha', 'users', '#8b5cf6', 4),
('Aruvai Maruthuvam', 'அறுவை மருத்துவம்', 'siddha', 'Surgery in Siddha', 'scissors', '#ef4444', 5),
('Research Methodology & Biostatistics', 'ஆராய்ச்சி முறையியல் & உயிரியல் புள்ளியியல்', 'research', 'Research Methods and Biostatistics', 'flask-conical', '#06b6d4', 6);
export interface Subject {
  id: string;
  name: string;
  name_tamil: string | null;
  category: 'siddha' | 'modern' | 'research';
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface Document {
  id: string;
  subject_id: string;
  user_id: string;
  title: string;
  document_type: DocumentType;
  language: 'tamil' | 'english' | 'bilingual';
  file_url: string;
  file_size: number | null;
  page_count: number | null;
  processing_status: ProcessingStatus;
  ocr_completed: boolean;
}

export type DocumentType =
  | 'textbook'
  | 'notes'
  | 'guide'
  | 'model_answer'
  | 'question_paper'
  | 'internal_medicine'
  | 'pediatrics'
  | 'obg'
  | 'surgery'
  | 'research_notes';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Chapter {
  id: string;
  document_id: string;
  subject_id: string;
  chapter_number: number | null;
  title: string;
  title_tamil: string | null;
  start_page: number | null;
  end_page: number | null;
}

export interface ContentChunk {
  id: string;
  document_id: string;
  chapter_id: string | null;
  subject_id: string;
  content: string;
  content_tamil: string | null;
  content_english: string | null;
  page_number: number | null;
  chunk_index: number | null;
  content_type: ContentType;
}

export type ContentType =
  | 'text'
  | 'medicine'
  | 'definition'
  | 'classification'
  | 'treatment'
  | 'symptom'
  | 'diagnosis';

export interface Medicine {
  id: string;
  name: string;
  name_tamil: string | null;
  category: string | null;
  dosage: string | null;
  dosage_tamil: string | null;
  indications: string | null;
  contraindications: string | null;
  source_document_id: string | null;
  source_chapter_id: string | null;
  source_page: number | null;
  source_book_name: string | null;
  preparation_method: string | null;
}

export interface Question {
  id: string;
  subject_id: string;
  document_id: string | null;
  question_type: QuestionType;
  question_text: string;
  question_tamil: string | null;
  answer: string | null;
  answer_tamil: string | null;
  answer_english: string | null;
  keywords: string[] | null;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency_count: number;
  last_asked_year: number | null;
  source_document_id: string | null;
  source_page: number | null;
  source_chapter: string | null;
  is_verified: boolean;
}

export type QuestionType = 'one_mark' | 'five_mark' | 'ten_mark';

export interface PreviousPaper {
  id: string;
  year: number;
  month: string | null;
  subject_id: string;
  document_id: string | null;
  total_questions: number | null;
}

export interface PaperQuestion {
  id: string;
  paper_id: string;
  question_id: string;
  question_number: number | null;
  marks: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  subject_id: string;
  questions_attempted: number;
  questions_correct: number;
  one_mark_completed: number;
  five_mark_completed: number;
  ten_mark_completed: number;
  last_study_date: string | null;
}

export interface RevisionItem {
  id: string;
  user_id: string;
  question_id: string;
  is_bookmarked: boolean;
  revision_count: number;
  last_revised_at: string | null;
  next_revision_date: string | null;
  confidence_level: number;
}

export interface SourceCitation {
  subject: string;
  book_name: string;
  chapter_name: string;
  page_number: number;
}

export interface TenMarkAnswer {
  definition: string;
  disease_number: string;
  nature: string;
  cause: string;
  symptoms: string;
  curable: string;
  types: string;
  prognosis: string;
  treatment: {
    objective: string;
    internal_medicines: Medicine[];
    external_medicines: Medicine[];
    diet: string;
    yoga: string;
    lifestyle: string;
    modern_comparison: string;
  };
  conclusion: string;
  sources: SourceCitation[];
}

export interface FiveMarkAnswer {
  definition: string;
  key_points: string[];
  classification: string;
  clinical_features: string[];
  sources: SourceCitation[];
}

export interface OneMarkAnswer {
  question: string;
  answer: string;
  source: SourceCitation;
}

export interface SearchResult {
  one_mark_questions: Question[];
  five_mark_questions: Question[];
  ten_mark_questions: Question[];
  siddha_treatment: string | null;
  siddha_medicines: Medicine[];
  modern_medicine_content: string | null;
  previous_year_questions: Question[];
  source_references: SourceCitation[];
}

export interface DashboardStats {
  uploaded_subjects: number;
  chapters_indexed: number;
  questions_generated: number;
  revision_progress: number;
  high_yield_topics: string[];
  previous_year_trends: {
    year: number;
    one_mark_count: number;
    five_mark_count: number;
    ten_mark_count: number;
  }[];
}

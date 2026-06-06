'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';
import { Subject, Document, DashboardStats } from '@/lib/types';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { SubjectCards } from './subject-cards';
import { StatsCards } from './stats-cards';
import { QuickActions } from './quick-actions';
import { RecentDocuments } from './recent-documents';
import { QuestionGenerator } from '@/components/questions/question-generator';
import { DocumentUploader } from '@/components/documents/document-uploader';
import { SearchView } from '@/components/search/search-view';
import { RevisionMode } from '@/components/revision/revision-mode';
import { PreviousPapers } from '@/components/papers/previous-papers';

type View = 'dashboard' | 'subject' | 'questions' | 'upload' | 'search' | 'revision' | 'papers';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    uploaded_subjects: 0,
    chapters_indexed: 0,
    questions_generated: 0,
    revision_progress: 0,
    high_yield_topics: [],
    previous_year_trends: [],
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      await fetchSubjects();
      setLoading(false);
    };
    initDashboard();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStats();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.from('subjects').select('*').order('sort_order');
      if (data) setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const supabase = getSupabase();
      const { count: docsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      setStats({
        uploaded_subjects: subjects.length,
        chapters_indexed: docsCount || 0,
        questions_generated: questionsCount || 0,
        revision_progress: 0,
        high_yield_topics: ['காமாலை நோய்', 'மந்தம்', 'வாதம்', 'பித்தம்', 'கபம்'],
        previous_year_trends: [
          { year: 2023, one_mark_count: 20, five_mark_count: 8, ten_mark_count: 4 },
          { year: 2022, one_mark_count: 20, five_mark_count: 8, ten_mark_count: 4 },
        ],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return (
          <DocumentUploader
            subjects={subjects}
            onUploadComplete={() => {
              fetchDocuments();
              setCurrentView('dashboard');
            }}
          />
        );
      case 'questions':
        return (
          <QuestionGenerator
            subjects={subjects}
            selectedSubject={selectedSubject}
          />
        );
      case 'search':
        return <SearchView subjects={subjects} />;
      case 'revision':
        return <RevisionMode subjects={subjects} />;
      case 'papers':
        return <PreviousPapers subjects={subjects} />;
      case 'subject':
        return (
          <div className="space-y-6">
            {selectedSubject && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold">{selectedSubject.name_tamil || selectedSubject.name}</h2>
                </div>
                <QuestionGenerator subjects={subjects} selectedSubject={selectedSubject} />
              </>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                வணக்கம்! Welcome
              </h1>
              <p className="text-muted-foreground">
                BSMS Final Year Exam Preparation Platform
              </p>
            </div>

            <StatsCards stats={stats} />

            <QuickActions
              onUploadClick={() => setCurrentView('upload')}
              onQuestionsClick={() => setCurrentView('questions')}
              onSearchClick={() => setCurrentView('search')}
              onRevisionClick={() => setCurrentView('revision')}
              onPapersClick={() => setCurrentView('papers')}
            />

            <SubjectCards
              subjects={subjects}
              onSelectSubject={handleSubjectSelect}
            />

            {documents.length > 0 && (
              <RecentDocuments documents={documents} />
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        subjects={subjects}
        onSubjectSelect={handleSubjectSelect}
        onSignOut={signOut}
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onSignOut={signOut}
        />

        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

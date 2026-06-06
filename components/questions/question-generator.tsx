'use client';

import { useState, useEffect } from 'react';
import { Subject, Question } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  FileQuestion,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Hash,
  Sparkles,
  X,
} from 'lucide-react';
import { OneMarkCard } from './one-mark-card';
import { FiveMarkCard } from './five-mark-card';
import { TenMarkCard } from './ten-mark-card';

interface QuestionGeneratorProps {
  subjects: Subject[];
  selectedSubject?: Subject | null;
}

export function QuestionGenerator({ subjects, selectedSubject }: QuestionGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'one_mark' | 'five_mark' | 'ten_mark'>('one_mark');
  const [currentSubject, setCurrentSubject] = useState<string>(selectedSubject?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentSubject) {
      fetchQuestions();
    }
  }, [currentSubject, activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    const supabase = getSupabase();
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject_id', currentSubject)
      .eq('question_type', activeTab);

    if (searchQuery) {
      query = query.ilike('question_text', `%${searchQuery}%`);
    }

    const { data, error } = await query.order('frequency_count', { ascending: false }).limit(20);

    if (error) {
      toast({
        title: 'Error fetching questions',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const handleGenerateQuestions = async () => {
    if (!currentSubject) {
      toast({
        title: 'Select a subject',
        description: 'Please select a subject first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const supabase = getSupabase();

    // In a real implementation, this would call an AI service
    // For now, generate sample questions
    const sampleQuestions: Partial<Question>[] = [];

    if (activeTab === 'one_mark') {
      const topics = ['மந்தம்', 'பித்தம்', 'கபம்', 'வாதம்', 'காமாலை', 'குட்டை மாலை'];
      topics.forEach((topic, i) => {
        sampleQuestions.push({
          subject_id: currentSubject,
          question_type: 'one_mark',
          question_text: `${topic} என்றால் என்ன?`,
          question_tamil: `${topic} என்றால் என்ன?`,
          answer: `${topic} - வரையறை மற்றும் அதன் சிறப்புகள்`,
          answer_tamil: `${topic} என்பது சித்த மருத்துவத்தில் ஒரு முக்கிய நோய் நிலை.`,
          keywords: [topic, 'வரையறை', 'சித்தம்'],
          difficulty: 'medium',
          source_chapter: 'முதல் அத்தியாயம்',
          source_page: i * 10 + 1,
        });
      });
    }

    if (sampleQuestions.length > 0) {
      const { error } = await supabase.from('questions').insert(sampleQuestions as any);
      if (error) {
        toast({
          title: 'Error generating questions',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Questions generated',
          description: `Generated ${sampleQuestions.length} questions`,
        });
        fetchQuestions();
      }
    }

    setLoading(false);
  };

  const getTabLabel = (type: string) => {
    switch (type) {
      case 'one_mark':
        return 'ஒரு மதிப்பெண் (One Mark)';
      case 'five_mark':
        return 'ஐந்து மதிப்பெண் (Five Mark)';
      case 'ten_mark':
        return 'பத்து மதிப்பெண் (Ten Mark)';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            வினா உருவாக்கி (Question Generator)
          </h2>
          <p className="text-muted-foreground">
            Generate One-Mark, Five-Mark, and Ten-Mark questions from your uploaded sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentSubject}
            onChange={(e) => setCurrentSubject(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-sm"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name_tamil || subject.name}
              </option>
            ))}
          </select>

          <Button onClick={handleGenerateQuestions} disabled={loading || !currentSubject}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="one_mark" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            One Mark
          </TabsTrigger>
          <TabsTrigger value="five_mark" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            Five Mark
          </TabsTrigger>
          <TabsTrigger value="ten_mark" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Ten Mark
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
              />
            </div>
            <Button variant="outline" onClick={fetchQuestions}>
              Search
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : questions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  வினாக்கள் இல்லை
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload documents and generate questions to get started
                </p>
                {currentSubject && (
                  <Button onClick={handleGenerateQuestions}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4 pr-4">
                {questions.map((question) => (
                  <div key={question.id}>
                    {question.question_type === 'one_mark' && (
                      <OneMarkCard question={question} />
                    )}
                    {question.question_type === 'five_mark' && (
                      <FiveMarkCard question={question} />
                    )}
                    {question.question_type === 'ten_mark' && (
                      <TenMarkCard question={question} />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Tabs>
    </div>
  );
}

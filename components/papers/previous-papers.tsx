'use client';

import { useState, useEffect } from 'react';
import { Subject, PreviousPaper, Question } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  TrendingUp,
  Hash,
  FileQuestion,
  BookOpenCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface PreviousPapersProps {
  subjects: Subject[];
}

interface PaperAnalysis {
  id: string;
  year: number;
  month: string | null;
  subject_name: string;
  one_mark_count: number;
  five_mark_count: number;
  ten_mark_count: number;
  total_questions: number;
}

interface FrequencyAnalysis {
  topic: string;
  count: number;
  last_asked: number;
}

export function PreviousPapers({ subjects }: PreviousPapersProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [papers, setPapers] = useState<PaperAnalysis[]>([]);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequencyAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSubject) {
      fetchPaperAnalysis();
    }
  }, [selectedSubject]);

  const fetchPaperAnalysis = async () => {
    setLoading(true);

    try {
      const supabase = getSupabase();
      // Fetch previous papers for subject
      const { data: papersData, error: papersError } = await supabase
        .from('previous_papers')
        .select(`
          id,
          year,
          month,
          total_questions,
          subject:subjects(name, name_tamil)
        `)
        .eq('subject_id', selectedSubject)
        .order('year', { ascending: false });

      if (papersError) throw papersError;

      // Get questions with frequency
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('question_text, question_tamil, frequency_count, last_asked_year, question_type')
        .eq('subject_id', selectedSubject)
        .gt('frequency_count', 0)
        .order('frequency_count', { ascending: false })
        .limit(20);

      if (questionsError) throw questionsError;

      // Process papers data
      const processedPapers = ((papersData || []) as any[]).map(paper => {
        const subject = paper.subject as any;
        return {
          id: paper.id,
          year: paper.year,
          month: paper.month,
          subject_name: subject?.name_tamil || subject?.name || 'Unknown',
          one_mark_count: 20,
          five_mark_count: 8,
          ten_mark_count: 4,
          total_questions: paper.total_questions || 32,
        };
      });

      // Process frequency data
      const frequencyData = ((questionsData || []) as any[]).map(q => ({
        topic: q.question_tamil || q.question_text,
        count: q.frequency_count,
        last_asked: q.last_asked_year || 2023,
      }));

      setPapers(processedPapers);
      setFrequentQuestions(frequencyData);

    } catch (error: any) {
      toast({
        title: 'Error fetching analysis',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: string | null) => {
    if (!month) return '';
    const months: Record<string, string> = {
      'january': 'ஜனவரி',
      'february': 'பிப்ரவரி',
      'march': 'மார்ச்',
      'april': 'ஏப்ரல்',
      'may': 'மே',
      'june': 'ஜூன்',
      'july': 'ஜூலை',
      'august': 'ஆகஸ்ட்',
      'september': 'செப்டம்பர்',
      'october': 'அக்டோபர்',
      'november': 'நவம்பர்',
      'december': 'டிசம்பர்',
    };
    return months[month.toLowerCase()] || month;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          முந்தைய வினாத்தாட்கள் (Previous Papers)
        </h2>
        <p className="text-muted-foreground">
          University question paper analysis and frequently asked questions
        </p>
      </div>

      {/* Subject Selection */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-sm"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name_tamil || subject.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSubject && (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exam Pattern Info */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  University Exam Pattern
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Hash className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">20</p>
                    <p className="text-sm text-muted-foreground">One Mark Questions</p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <FileQuestion className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Five Mark Questions</p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <BookOpenCheck className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">4</p>
                    <p className="text-sm text-muted-foreground">Ten Mark Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previous Papers List */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Previous University Papers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {papers.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4 pr-4">
                      {papers.map(paper => (
                        <div
                          key={paper.id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedPaper(expandedPaper === paper.id ? null : paper.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {paper.year} - {getMonthName(paper.month)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {paper.subject_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">
                                {paper.total_questions} Questions
                              </Badge>
                              {expandedPaper === paper.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>

                          {expandedPaper === paper.id && (
                            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {paper.one_mark_count} One Marks
                                </Badge>
                              </div>
                              <div className="text-center">
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                  <FileQuestion className="h-3 w-3 mr-1" />
                                  {paper.five_mark_count} Five Marks
                                </Badge>
                              </div>
                              <div className="text-center">
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  <BookOpenCheck className="h-3 w-3 mr-1" />
                                  {paper.ten_mark_count} Ten Marks
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload previous year question papers to see analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Frequently Asked Topics */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Frequently Asked Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {frequentQuestions.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3 pr-4">
                      {frequentQuestions.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                              {item.topic}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              Asked {item.count}x
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last: {item.last_asked}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload question papers to see frequently asked topics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predicted Topics */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Predicted Important Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['முக்குறி குணங்கள்', 'வாதம் மருத்துவம்', 'பித்தம் நோய்கள்', 'கப சிகிச்சை', 'மந்த வகைகள்', 'காமாலை'].map((topic, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{topic}</span>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        High Priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

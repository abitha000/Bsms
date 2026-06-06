'use client';

import { useState, useEffect } from 'react';
import { Subject, Question } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw,
  Hash,
  FileQuestion,
  BookOpenCheck,
  CheckCircle,
  Star,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { OneMarkCard } from '@/components/questions/one-mark-card';
import { FiveMarkCard } from '@/components/questions/five-mark-card';
import { TenMarkCard } from '@/components/questions/ten-mark-card';

interface RevisionModeProps {
  subjects: Subject[];
}

export function RevisionMode({ subjects }: RevisionModeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'one_mark' | 'five_mark' | 'ten_mark'>('one_mark');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (selectedSubject) {
      fetchHighYieldQuestions();
    }
  }, [selectedSubject, activeTab]);

  const fetchHighYieldQuestions = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', selectedSubject)
      .eq('question_type', activeTab)
      .order('frequency_count', { ascending: false })
      .limit(activeTab === 'one_mark' ? 100 : activeTab === 'five_mark' ? 50 : 25);

    if (error) {
      toast({
        title: 'Error fetching questions',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setQuestions(data || []);
      setCurrentQuestion(0);
      setShowAnswer(false);
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleMarkComplete = () => {
    const questionId = questions[currentQuestion]?.id;
    if (questionId) {
      setCompletedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.add(questionId);
        return newSet;
      });
    }
    handleNext();
  };

  const current = questions[currentQuestion];

  const getProgress = () => {
    const target = activeTab === 'one_mark' ? 100 : activeTab === 'five_mark' ? 50 : 25;
    return Math.round((completedQuestions.size / target) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          திரும்பப் பார்வை (Revision Mode)
        </h2>
        <p className="text-muted-foreground">
          High-yield questions for quick revision before exams
        </p>
      </div>

      {/* Subject Selection */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
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
            </div>

            {selectedSubject && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">
                    {getProgress()}% Complete
                  </span>
                </div>
                <Progress value={getProgress()} className="w-32" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSubject && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="one_mark" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Top 100 (One Mark)
            </TabsTrigger>
            <TabsTrigger value="five_mark" className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Top 50 (Five Mark)
            </TabsTrigger>
            <TabsTrigger value="ten_mark" className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4" />
              Top 25 (Ten Mark)
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : questions.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Questions Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload documents and generate questions to start revision
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Progress Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      Question {currentQuestion + 1} of {questions.length}
                    </Badge>
                    {completedQuestions.has(current.id) && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {activeTab === 'one_mark' && 'Quick revision'}
                    {activeTab === 'five_mark' && 'Detailed review'}
                    {activeTab === 'ten_mark' && 'In-depth study'}
                  </div>
                </div>

                {/* Question Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {current.question_tamil || current.question_text}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {current.frequency_count > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            Asked {current.frequency_count}x
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Show/Hide Answer */}
                    {!showAnswer ? (
                      <Button onClick={() => setShowAnswer(true)} className="w-full">
                        Show Answer
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                            Answer:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {current.answer_tamil || current.answer || 'Information not found in uploaded sources.'}
                          </p>
                        </div>

                        {current.keywords && current.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {current.keywords.map((keyword, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleMarkComplete}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Complete
                        </Button>
                        <Button onClick={handleNext} className="gap-2">
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {completedQuestions.size}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {questions.length - completedQuestions.size}
                      </p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {currentQuestion + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

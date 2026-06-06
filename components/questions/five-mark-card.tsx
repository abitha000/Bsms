'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen, FileText, FileQuestion } from 'lucide-react';

interface FiveMarkCardProps {
  question: Question;
}

export function FiveMarkCard({ question }: FiveMarkCardProps) {
  const [expanded, setExpanded] = useState(false);

  const parseAnswer = (answer: string | null) => {
    if (!answer) return null;
    const sections = answer.split('\n\n');
    return {
      definition: sections[0] || '',
      points: sections.slice(1).filter(s => s.trim()),
    };
  };

  const answer = parseAnswer(question.answer_tamil || question.answer);

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <FileQuestion className="h-3 w-3 mr-1" />
                5 Marks
              </Badge>
              <Badge variant="secondary">
                {question.frequency_count > 0 && `Asked ${question.frequency_count}x`}
              </Badge>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {question.question_tamil || question.question_text}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expanded && (
          <div className="space-y-4">
            {question.answer_tamil || question.answer ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    வரையறை (Definition):
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {answer?.definition}
                  </p>
                </div>

                {answer?.points && answer.points.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      முக்கிய புள்ளிகள் (Key Points):
                    </p>
                    <ul className="space-y-2">
                      {answer.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium text-purple-700 dark:text-purple-300">
                            {i + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-muted-foreground italic">
                  Information not found in uploaded sources.
                </p>
              </div>
            )}

            {question.keywords && question.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}

            {(question.source_chapter || question.source_page) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                {question.source_chapter && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {question.source_chapter}
                  </span>
                )}
                {question.source_page && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Page {question.source_page}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

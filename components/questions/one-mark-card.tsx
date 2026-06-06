'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen, Hash, FileText } from 'lucide-react';

interface OneMarkCardProps {
  question: Question;
}

export function OneMarkCard({ question }: OneMarkCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <Hash className="h-3 w-3 mr-1" />
                1 Mark
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
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                Answer:
              </p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {question.answer_tamil || question.answer || 'Information not found in uploaded sources.'}
              </p>
            </div>

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

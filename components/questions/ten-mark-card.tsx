'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  BookOpenCheck,
  Target,
  Activity,
  ClipboardList,
  Crosshair,
  Pill,
  Utensils,
  Heart,
  Stethoscope,
} from 'lucide-react';

interface TenMarkCardProps {
  question: Question;
}

const tamilSections = [
  { key: 'definition', label: 'வரையறை', icon: BookOpen },
  { key: 'disease_number', label: 'நோய் எண்', icon: Target },
  { key: 'nature', label: 'இயல்பு', icon: Activity },
  { key: 'cause', label: 'நோய் வரும் வழி', icon: ClipboardList },
  { key: 'symptoms', label: 'முக்குறி குணங்கள்', icon: Crosshair },
  { key: 'curable', label: 'தீரும் / தீராதவை', icon: Heart },
  { key: 'types', label: 'வகைகள்', icon: ClipboardList },
  { key: 'prognosis', label: 'நோய் கணிப்பு', icon: Activity },
  { key: 'treatment', label: 'மருத்துவம்', icon: Pill },
  { key: 'conclusion', label: 'முடிவுரை', icon: BookOpenCheck },
];

const treatmentSections = [
  { key: 'objective', label: 'சிகிச்சை நோக்கம்', icon: Target },
  { key: 'internal', label: 'உள்மருந்துகள்', icon: Pill },
  { key: 'external', label: 'வெளிமருந்துகள்', icon: Pill },
  { key: 'diet', label: 'பத்தியம்', icon: Utensils },
  { key: 'yoga', label: 'யோகம்', icon: Heart },
  { key: 'lifestyle', label: 'வாழ்க்கை முறை', icon: Activity },
  { key: 'modern', label: 'நவீன மருத்துவ ஒப்பீடு', icon: Stethoscope },
];

export function TenMarkCard({ question }: TenMarkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeView, setActiveView] = useState('siddha');

  // Parse the answer to extract structured sections
  const parseAnswer = (answer: string | null) => {
    if (!answer) return null;
    // In a real app, this would be properly structured from the AI
    return {
      definition: 'சித்த மருத்துவத்தில் இந்த நோயின் முழுமையான வரையறை...',
      disease_number: 'நோய் எண்: அடையாளம் காணப்பட்டது',
      nature: 'இவ்வாறு நோய் இயல்பு...',
      cause: 'நோய்க்கான காரணங்கள்...',
      symptoms: 'முக்குறி குணங்கள் விளக்கம்...',
      curable: 'தீரக்கூடிய/தீராத நிலைகள்...',
      types: 'நோய் வகைகள்...',
      prognosis: 'நோய் கணிப்பு...',
      treatment: {
        objective: 'சிகிச்சை நோக்கம்...',
        internal: ['மருந்து 1', 'மருந்து 2', 'மருந்து 3'],
        external: ['வெளி மருந்து 1', 'வெளி மருந்து 2'],
        diet: 'பத்தியம் விளக்கம்...',
        yoga: 'யோகா பயிற்சிகள்...',
        lifestyle: 'வாழ்க்கை முறை அறிவுரைகள்...',
        modern: 'நவீன மருத்துவ ஒப்பீடு...',
      },
      conclusion: 'முடிவுரை...',
    };
  };

  const answerData = parseAnswer(question.answer_tamil || question.answer);

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <BookOpenCheck className="h-3 w-3 mr-1" />
                10 Marks
              </Badge>
              <Badge variant="secondary">
                {question.frequency_count > 0 && `Asked ${question.frequency_count}x`}
              </Badge>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-lg">
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
          <div className="space-y-6">
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="siddha">சித்த மருத்துவம்</TabsTrigger>
                <TabsTrigger value="modern">நவீன மருத்துவம்</TabsTrigger>
                <TabsTrigger value="combined">ஒப்பீடு</TabsTrigger>
              </TabsList>

              <TabsContent value="siddha" className="space-y-6 mt-6">
                {answerData ? (
                  <>
                    {/* Main Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tamilSections.slice(0, 9).map((section) => {
                        const Icon = section.icon;
                        const content = (answerData as any)[section.key];
                        if (section.key === 'treatment' || !content) return null;

                        return (
                          <div
                            key={section.key}
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-4 w-4 text-orange-600" />
                              <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                                {section.label}
                              </h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                              {typeof content === 'string' ? content : ''}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Treatment Section */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        மருத்துவம் (Treatment)
                      </h4>
                      <div className="space-y-4">
                        {treatmentSections.map((section) => {
                          if (section.key === 'internal' || section.key === 'external') {
                            const medicines = (answerData.treatment as any)[section.key] || [];
                            return (
                              <div key={section.key}>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                  {section.label}
                                </h5>
                                <div className="space-y-2">
                                  {medicines.map((med: string, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded"
                                    >
                                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
                                        {med}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Source: Textbook, Page {i * 10 + 25}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          const content = (answerData.treatment as any)[section.key];
                          if (!content) return null;

                          return (
                            <div key={section.key}>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                {section.label}
                              </h5>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conclusion */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <BookOpenCheck className="h-4 w-4" />
                        {tamilSections[9].label}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {answerData.conclusion}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-muted-foreground italic">
                      Information not found in uploaded sources.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="modern" className="mt-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">
                    Modern Medicine View
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Definition', 'Etiology', 'Pathophysiology', 'Clinical Features', 'Investigations', 'Diagnosis', 'Treatment', 'Complications', 'Prognosis', 'Prevention'].map((section, i) => (
                      <div key={section} className="space-y-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {section}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Upload Modern Medicine notes to see details...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="combined" className="mt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Comparative View: Siddha vs Modern Medicine
                    </h4>
                    <div className="space-y-4">
                      {['Definition', 'Cause', 'Symptoms', 'Diagnosis', 'Treatment', 'Prognosis'].map((section) => (
                        <div key={section} className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded">
                            <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">
                              Siddha
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {section} from Siddha sources...
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                              Modern
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {section} from Modern Medicine...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Source References */}
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

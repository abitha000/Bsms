'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileQuestion, Search, RefreshCw, FileText } from 'lucide-react';

interface QuickActionsProps {
  onUploadClick: () => void;
  onQuestionsClick: () => void;
  onSearchClick: () => void;
  onRevisionClick: () => void;
  onPapersClick: () => void;
}

export function QuickActions({
  onUploadClick,
  onQuestionsClick,
  onSearchClick,
  onRevisionClick,
  onPapersClick,
}: QuickActionsProps) {
  const actions = [
    {
      title: 'Upload Documents',
      titleTamil: 'ஆவணங்கள் பதிவேற்று',
      description: 'Add textbooks, notes, question papers',
      icon: Upload,
      color: 'bg-blue-500',
      onClick: onUploadClick,
    },
    {
      title: 'Generate Questions',
      titleTamil: 'கேள்விகள் உருவாக்கு',
      description: 'One, Five, Ten mark questions',
      icon: FileQuestion,
      color: 'bg-emerald-500',
      onClick: onQuestionsClick,
    },
    {
      title: 'Search Topics',
      titleTamil: 'தலைப்புகளைத் தேடு',
      description: 'Find diseases, medicines, definitions',
      icon: Search,
      color: 'bg-purple-500',
      onClick: onSearchClick,
    },
    {
      title: 'Revision Mode',
      titleTamil: 'திரும்பப் பார்வை',
      description: 'High-yield topics for quick review',
      icon: RefreshCw,
      color: 'bg-orange-500',
      onClick: onRevisionClick,
    },
    {
      title: 'Previous Papers',
      titleTamil: 'முந்தைய தாள்கள்',
      description: 'University question paper analysis',
      icon: FileText,
      color: 'bg-pink-500',
      onClick: onPapersClick,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={action.onClick}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {action.titleTamil}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Document } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface RecentDocumentsProps {
  documents: Document[];
}

const statusIcons: Record<string, any> = {
  pending: { icon: Clock, color: 'text-gray-400' },
  processing: { icon: Loader2, color: 'text-blue-500 animate-spin' },
  completed: { icon: CheckCircle, color: 'text-emerald-500' },
  failed: { icon: AlertCircle, color: 'text-red-500' },
};

const docTypeLabels: Record<string, string> = {
  textbook: 'பாடநூல்',
  notes: 'குறிப்புகள்',
  guide: 'வழிகாட்டி',
  model_answer: 'மாதிரி விடை',
  question_paper: 'வினாத்தாள்',
  internal_medicine: 'உள் மருத்துவம்',
  pediatrics: 'குழந்தை மருத்துவம்',
  obg: 'மகளிர் மருத்துவம்',
  surgery: 'அறுவை மருத்துவம்',
  research_notes: 'ஆராய்ச்சி குறிப்புகள்',
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Recent Uploads
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const status = statusIcons[doc.processing_status] || statusIcons.pending;
          const StatusIcon = status.icon;
          return (
            <Card key={doc.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {docTypeLabels[doc.document_type] || doc.document_type}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <StatusIcon className={`h-3 w-3 ${status.color}`} />
                        {doc.processing_status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

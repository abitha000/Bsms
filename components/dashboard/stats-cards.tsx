'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { FileText, BookOpen, HelpCircle, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: 'Uploaded Documents',
      labelTamil: 'பதிவேற்ற ஆவணங்கள்',
      value: stats.chapters_indexed,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Questions Generated',
      labelTamil: 'உருவாக்கப்பட்ட வினாக்கள்',
      value: stats.questions_generated,
      icon: HelpCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    },
    {
      label: 'Revision Progress',
      labelTamil: 'திரும்பப் பார்வை முன்னேற்றம்',
      value: `${Math.round(stats.revision_progress)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      label: 'Subjects',
      labelTamil: 'பாடங்கள்',
      value: stats.uploaded_subjects,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.labelTamil}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import { Subject } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Users,
  Scissors,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  baby: Baby,
  users: Users,
  scissors: Scissors,
  'flask-conical': FlaskConical,
};

interface SubjectCardsProps {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
}

export function SubjectCards({ subjects, onSelectSubject }: SubjectCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          பாடங்கள் (Subjects)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const Icon = iconMap[subject.icon || 'stethoscope'] || Stethoscope;
          return (
            <Card
              key={subject.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSelectSubject(subject)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: subject.color || '#10b981' }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {subject.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">
                  {subject.name_tamil || subject.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {subject.name}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Click to study
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

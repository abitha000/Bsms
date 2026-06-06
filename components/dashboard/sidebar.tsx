'use client';

import { cn } from '@/lib/utils';
import { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Home,
  Upload,
  FileQuestion,
  Search,
  RefreshCw,
  FileText,
  LogOut,
  X,
  BookOpen,
} from 'lucide-react';
type View = 'dashboard' | 'subject' | 'questions' | 'upload' | 'search' | 'revision' | 'papers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
  subjects: Subject[];
  onSubjectSelect: (subject: Subject) => void;
  onSignOut: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', labelTamil: 'முகப்பு', icon: Home },
  { id: 'upload', label: 'Upload Docs', labelTamil: 'ஆவணங்கள்', icon: Upload },
  { id: 'questions', label: 'Questions', labelTamil: 'வினாக்கள்', icon: FileQuestion },
  { id: 'search', label: 'Search', labelTamil: 'தேடல்', icon: Search },
  { id: 'revision', label: 'Revision', labelTamil: 'திரும்பப் பார்வை', icon: RefreshCw },
  { id: 'papers', label: 'Previous Papers', labelTamil: 'முந்தைய தாள்கள்', icon: FileText },
];

export function Sidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  subjects,
  onSubjectSelect,
  onSignOut,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white truncate">
                BSMS Exam
              </h1>
              <p className="text-xs text-muted-foreground">Final Year Assistant</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as View);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.labelTamil}</span>
                  </button>
                );
              })}
            </nav>

            <Separator className="my-4" />

            {/* Subjects */}
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                பாடங்கள் (Subjects)
              </h3>
              <nav className="space-y-1">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      onSubjectSelect(subject);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color || '#10b981' }}
                    />
                    <span className="truncate">
                      {subject.name_tamil || subject.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </ScrollArea>

          {/* Sign out */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-400"
              onClick={onSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

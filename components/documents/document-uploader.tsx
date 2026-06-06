'use client';

import { useState, useCallback } from 'react';
import { Subject } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileQuestion,
} from 'lucide-react';

interface DocumentUploaderProps {
  subjects: Subject[];
  onUploadComplete: () => void;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  documentId?: string;
  error?: string;
}

const documentTypes = [
  { value: 'textbook', label: 'பாடநூல் (Textbook)', icon: BookOpen },
  { value: 'notes', label: 'குறிப்புகள் (Notes)', icon: FileText },
  { value: 'guide', label: 'வழிகாட்டி (Guide)', icon: BookOpen },
  { value: 'model_answer', label: 'மாதிரி விடை (Model Answer)', icon: FileText },
  { value: 'question_paper', label: 'வினாத்தாள் (Question Paper)', icon: FileQuestion },
  { value: 'internal_medicine', label: 'Internal Medicine Notes', icon: FileText },
  { value: 'pediatrics', label: 'Pediatrics Notes', icon: FileText },
  { value: 'obg', label: 'OBG Notes', icon: FileText },
  { value: 'surgery', label: 'Surgery Notes', icon: FileText },
  { value: 'research_notes', label: 'Research Methodology Notes', icon: FileText },
];

const languageOptions = [
  { value: 'tamil', label: 'தமிழ் (Tamil)' },
  { value: 'english', label: 'English' },
  { value: 'bilingual', label: 'இருமொழி (Bilingual)' },
];

export function DocumentUploader({ subjects, onUploadComplete }: DocumentUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<string>('textbook');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tamil');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(f => f.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF files only',
        variant: 'destructive',
      });
      return;
    }

    const newFiles = pdfFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        f => f.type === 'application/pdf'
      );
      const newFiles = selectedFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || !selectedSubject || files.length === 0) return;

    setIsUploading(true);
    const supabaseClient = getSupabase();

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      if (uploadedFile.status !== 'pending') continue;

      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' } : f
        )
      );

      try {
        // Generate unique filename
        const fileExt = uploadedFile.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('documents')
          .upload(fileName, uploadedFile.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabaseClient.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Create document record
        const { data: docData, error: docError } = await supabaseClient
          .from('documents')
          .insert({
            user_id: user.id,
            subject_id: selectedSubject,
            title: uploadedFile.file.name.replace(/\.[^/.]+$/, ''),
            document_type: selectedDocType,
            language: selectedLanguage,
            file_url: urlData.publicUrl,
            file_size: uploadedFile.file.size,
            processing_status: 'processing',
          } as any)
          .select()
          .single();

        if (docError) throw docError;

        const documentId = (docData as any)?.id;

        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'processing', progress: 100, documentId }
              : f
          )
        );

        // Simulate processing (in real app, this would be a background process)
        setTimeout(() => {
          setFiles(prev =>
            prev.map((f, idx) =>
              idx === i && f.documentId === documentId
                ? { ...f, status: 'completed' }
                : f
            )
          );
        }, 2000);

      } catch (error: any) {
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    // Check if all completed
    const allCompleted = files.every(f => f.status === 'completed');
    if (allCompleted) {
      toast({
        title: 'Upload complete',
        description: 'All documents uploaded and processing',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ஆவணங்கள் பதிவேற்று (Upload Documents)
        </h2>
        <p className="text-muted-foreground">
          Upload your textbooks, notes, guides, and question papers
        </p>
      </div>

      {/* Upload Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>Select subject and document type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: subject.color || '#10b981' }}
                        />
                        {subject.name_tamil || subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drag and drop PDF files here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <Input
            type="file"
            accept=".pdf"
            multiple
            className="max-w-xs"
            onChange={handleFileSelect}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <FileText className="h-8 w-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {file.file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'pending' && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {file.status === 'processing' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Processing
                    </Badge>
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  {file.status === 'error' && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-500">{file.error}</span>
                    </div>
                  )}
                  {file.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                onClick={uploadFiles}
                disabled={!selectedSubject || files.length === 0 || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload All
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const allCompleted = files.every(f => f.status === 'completed');
                  if (allCompleted) {
                    onUploadComplete();
                  }
                }}
                disabled={!files.some(f => f.status === 'completed')}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

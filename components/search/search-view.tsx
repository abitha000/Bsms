'use client';

import { useState } from 'react';
import { Subject, Question, Medicine } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Loader2,
  Hash,
  FileQuestion,
  BookOpenCheck,
  Pill,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { OneMarkCard } from '@/components/questions/one-mark-card';
import { FiveMarkCard } from '@/components/questions/five-mark-card';
import { TenMarkCard } from '@/components/questions/ten-mark-card';

interface SearchViewProps {
  subjects: Subject[];
}

export function SearchView({ subjects }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    oneMark: Question[];
    fiveMark: Question[];
    tenMark: Question[];
    medicines: Medicine[];
  }>({
    oneMark: [],
    fiveMark: [],
    tenMark: [],
    medicines: [],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Enter a search term',
        description: 'Please enter a disease name or topic to search',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const supabase = getSupabase();
      // Search questions
      const questionsQuery = supabase
        .from('questions')
        .select('*');

      if (selectedSubject) {
        questionsQuery.eq('subject_id', selectedSubject);
      }

      // Use ilike for case-insensitive search
      const orCondition = `question_text.ilike.%${query}%,question_tamil.ilike.%${query}%,answer.ilike.%${query}%,answer_tamil.ilike.%${query}%`;

      const { data: questionData, error: questionError } = await questionsQuery
        .or(orCondition)
        .limit(50);

      if (questionError) throw questionError;

      // Search medicines
      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .select('*')
        .or(`name.ilike.%${query}%,name_tamil.ilike.%${query}%,indications.ilike.%${query}%`)
        .limit(20);

      if (medicineError) throw medicineError;

      // Categorize questions
      const questionsArray = (questionData || []) as any[];
      const medicinesArray = (medicineData || []) as any[];
      const oneMark = questionsArray.filter(q => q.question_type === 'one_mark');
      const fiveMark = questionsArray.filter(q => q.question_type === 'five_mark');
      const tenMark = questionsArray.filter(q => q.question_type === 'ten_mark');

      setResults({
        oneMark,
        fiveMark,
        tenMark,
        medicines: medicinesArray,
      });

    } catch (error: any) {
      toast({
        title: 'Search error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.oneMark.length + results.fiveMark.length + results.tenMark.length + results.medicines.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          தேடல் (Search)
        </h2>
        <p className="text-muted-foreground">
          Search for diseases, topics, medicines, and questions
        </p>
      </div>

      {/* Search Input */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search disease (e.g., காமாலை, Jaundice)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-sm"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name_tamil || subject.name}
                </option>
              ))}
            </select>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {totalResults} results found
            </Badge>
          </div>

          {totalResults === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  முடிவுகள் இல்லை (No Results)
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or upload more documents
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="questions">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Questions ({results.oneMark.length + results.fiveMark.length + results.tenMark.length})
                </TabsTrigger>
                <TabsTrigger value="medicines" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medicines ({results.medicines.length})
                </TabsTrigger>
                <TabsTrigger value="siddha">
                  Siddha View
                </TabsTrigger>
                <TabsTrigger value="modern">
                  Modern View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="mt-6">
                <ScrollArea className="h-[calc(100vh-450px)]">
                  <div className="space-y-8 pr-4">
                    {/* One Mark Questions */}
                    {results.oneMark.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Hash className="h-5 w-5 text-emerald-600" />
                          One Mark Questions ({results.oneMark.length})
                        </h3>
                        {results.oneMark.map(q => (
                          <OneMarkCard key={q.id} question={q} />
                        ))}
                      </div>
                    )}

                    {/* Five Mark Questions */}
                    {results.fiveMark.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FileQuestion className="h-5 w-5 text-purple-600" />
                          Five Mark Questions ({results.fiveMark.length})
                        </h3>
                        {results.fiveMark.map(q => (
                          <FiveMarkCard key={q.id} question={q} />
                        ))}
                      </div>
                    )}

                    {/* Ten Mark Questions */}
                    {results.tenMark.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <BookOpenCheck className="h-5 w-5 text-orange-600" />
                          Ten Mark Questions ({results.tenMark.length})
                        </h3>
                        {results.tenMark.map(q => (
                          <TenMarkCard key={q.id} question={q} />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="medicines" className="mt-6">
                <ScrollArea className="h-[calc(100vh-450px)]">
                  {results.medicines.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                      {results.medicines.map(medicine => (
                        <Card key={medicine.id} className="border-0 shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {medicine.name_tamil || medicine.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {medicine.name}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                <Pill className="h-3 w-3 mr-1" />
                                Siddha Medicine
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {medicine.dosage && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Dosage (அளவு)
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {medicine.dosage_tamil || medicine.dosage}
                                </p>
                              </div>
                            )}

                            {medicine.indications && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Indications
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {medicine.indications}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                              {medicine.source_book_name && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {medicine.source_book_name}
                                </span>
                              )}
                              {medicine.source_page && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Page {medicine.source_page}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No medicines found for this search term
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="siddha" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-4">
                      Siddha Medicine View
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="font-medium mb-2">Upload Siddha textbooks to see detailed results</p>
                        <p className="text-sm text-muted-foreground">
                          Search results will include Siddha definitions, causes, symptoms, treatments, and exact medicine names from your uploaded sources.
                        </p>
                      </div>
                      {results.tenMark.length > 0 && (
                        <TenMarkCard question={results.tenMark[0]} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="modern" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">
                      Modern Medicine View
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium mb-2">Upload Modern Medicine notes to see detailed results</p>
                        <p className="text-sm text-muted-foreground">
                          Search results will include Definition, Etiology, Pathophysiology, Clinical Features, Investigations, Diagnosis, Treatment, Complications, and Prevention.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}

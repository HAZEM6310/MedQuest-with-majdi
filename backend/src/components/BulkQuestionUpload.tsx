import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Download, AlertCircle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  title_en?: string;
  title_fr?: string;
}

interface Faculty {
  id: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  university_name?: string;
  university_name_en?: string;
}

interface BulkQuestion {
  course_id: string;
  text_en: string;
  text_fr: string;
  explanation_en: string;
  explanation_fr: string;
  option1_en: string;
  option1_fr: string;
  option1_correct: boolean;
  option2_en: string;
  option2_fr: string;
  option2_correct: boolean;
  option3_en: string;
  option3_fr: string;
  option3_correct: boolean;
  option4_en: string;
  option4_fr: string;
  option4_correct: boolean;
  option5_en: string;
  option5_fr: string;
  option5_correct: boolean;
  group_id?: string; // For clinical cases
}

interface BulkClinicalCase {
  course_id: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  order_index?: number;
  questions: BulkQuestion[];
}

interface BulkQuestionUploadProps {
  courses: Course[];
  faculties?: Faculty[];
}

export default function BulkQuestionUpload({ courses, faculties = [] }: BulkQuestionUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<BulkQuestion[]>([]);
  const [parsedClinicalCases, setParsedClinicalCases] = useState<BulkClinicalCase[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadType, setUploadType] = useState<'questions' | 'clinicalCases'>('questions');
  const queryClient = useQueryClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        if (uploadType === 'questions') {
          parseCSVFile(file);
        } else {
          parseClinicalCaseCSVFile(file);
        }
      } else {
        toast.error("Please select a CSV file");
      }
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error("Failed to read file");
        return;
      }
      
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file must have header row and at least one data row");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expectedHeaders = [
        'text_en', 'text_fr', 'explanation_en', 'explanation_fr',
        'option1_en', 'option1_fr', 'option1_correct',
        'option2_en', 'option2_fr', 'option2_correct',
        'option3_en', 'option3_fr', 'option3_correct',
        'option4_en', 'option4_fr', 'option4_correct',
        'option5_en', 'option5_fr', 'option5_correct'
      ];

      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing headers: ${missingHeaders.join(', ')}`);
        return;
      }

      const questions: BulkQuestion[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const question = { course_id: selectedCourse } as Record<string, any>;
        headers.forEach((header, index) => {
          if (header.includes('_correct')) {
            question[header] = values[index].toLowerCase() === 'true';
          } else {
            question[header] = values[index];
          }
        });

        // Validate that at least one option is correct
        const hasCorrectAnswer = [
          question.option1_correct,
          question.option2_correct,
          question.option3_correct,
          question.option4_correct,
          question.option5_correct
        ].some(Boolean);

        if (!hasCorrectAnswer) {
          errors.push(`Row ${i + 1}: No correct answer marked`);
          continue;
        }

        if (!question.text_en || !question.text_fr) {
          errors.push(`Row ${i + 1}: Question text missing`);
          continue;
        }

        questions.push(question as BulkQuestion);
      }

      setParsedQuestions(questions);
      setParsedClinicalCases([]);
      setValidationErrors(errors);
      
      if (questions.length > 0) {
        toast.success(`Parsed ${questions.length} questions successfully`);
      }
    };
    reader.readAsText(file);
  };

  const parseClinicalCaseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error("Failed to read file");
        return;
      }
      
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file must have header row and at least one data row");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expectedHeaders = [
        'case_id', 'title_en', 'title_fr', 'description_en', 'description_fr', 'order_index',
        'text_en', 'text_fr', 'explanation_en', 'explanation_fr',
        'option1_en', 'option1_fr', 'option1_correct',
        'option2_en', 'option2_fr', 'option2_correct',
        'option3_en', 'option3_fr', 'option3_correct',
        'option4_en', 'option4_fr', 'option4_correct',
        'option5_en', 'option5_fr', 'option5_correct'
      ];

      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing headers: ${missingHeaders.join(', ')}`);
        return;
      }

      const errors: string[] = [];
      const clinicalCases: Map<string, BulkClinicalCase> = new Map();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const row = {} as Record<string, any>;
        headers.forEach((header, index) => {
          if (header.includes('_correct')) {
            row[header] = values[index].toLowerCase() === 'true';
          } else if (header === 'order_index') {
            row[header] = values[index] ? parseInt(values[index]) : 0;
          } else {
            row[header] = values[index];
          }
        });

        // Extract case information
        const caseId = row.case_id;
        if (!caseId) {
          errors.push(`Row ${i + 1}: Missing case_id`);
          continue;
        }
        
        // Check if case already exists in our map
        if (!clinicalCases.has(caseId)) {
          // Create new case
          clinicalCases.set(caseId, {
            course_id: selectedCourse,
            title_en: row.title_en,
            title_fr: row.title_fr,
            description_en: row.description_en,
            description_fr: row.description_fr,
            order_index: row.order_index,
            questions: []
          });
        }
        
        // Validate that at least one option is correct
        const hasCorrectAnswer = [
          row.option1_correct,
          row.option2_correct,
          row.option3_correct,
          row.option4_correct,
          row.option5_correct
        ].some(Boolean);

        if (!hasCorrectAnswer) {
          errors.push(`Row ${i + 1}: No correct answer marked`);
          continue;
        }

        if (!row.text_en || !row.text_fr) {
          errors.push(`Row ${i + 1}: Question text missing`);
          continue;
        }

        // Add question to case
        const question: BulkQuestion = {
          course_id: selectedCourse,
          text_en: row.text_en,
          text_fr: row.text_fr,
          explanation_en: row.explanation_en,
          explanation_fr: row.explanation_fr,
          option1_en: row.option1_en,
          option1_fr: row.option1_fr,
          option1_correct: row.option1_correct,
          option2_en: row.option2_en,
          option2_fr: row.option2_fr,
          option2_correct: row.option2_correct,
          option3_en: row.option3_en,
          option3_fr: row.option3_fr,
          option3_correct: row.option3_correct,
          option4_en: row.option4_en,
          option4_fr: row.option4_fr,
          option4_correct: row.option4_correct,
          option5_en: row.option5_en,
          option5_fr: row.option5_fr,
          option5_correct: row.option5_correct,
        };
        
        clinicalCases.get(caseId)?.questions.push(question);
      }

      const casesArray = Array.from(clinicalCases.values());
      setParsedClinicalCases(casesArray);
      setParsedQuestions([]);
      setValidationErrors(errors);
      
      if (casesArray.length > 0) {
        toast.success(`Parsed ${casesArray.length} clinical cases with ${casesArray.reduce((sum, c) => sum + c.questions.length, 0)} questions successfully`);
      }
    };
    reader.readAsText(file);
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (questions: BulkQuestion[]) => {
      setIsUploading(true);
      setUploadProgress(0);

      const totalQuestions = questions.length;
      let processedCount = 0;

      for (const questionData of questions) {
        try {
          // Insert question
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert([{
              course_id: questionData.course_id,
              faculty_id: selectedFaculty === "null" ? null : selectedFaculty || null,
              text: questionData.text_en,
              text_en: questionData.text_en,
              text_fr: questionData.text_fr,
              explanation: questionData.explanation_en,
              explanation_en: questionData.explanation_en,
              explanation_fr: questionData.explanation_fr
            }])
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert options
          const optionsData = [
            {
              question_id: question.id,
              text: questionData.option1_en,
              text_en: questionData.option1_en,
              text_fr: questionData.option1_fr,
              is_correct: questionData.option1_correct
            },
            {
              question_id: question.id,
              text: questionData.option2_en,
              text_en: questionData.option2_en,
              text_fr: questionData.option2_fr,
              is_correct: questionData.option2_correct
            },
            {
              question_id: question.id,
              text: questionData.option3_en,
              text_en: questionData.option3_en,
              text_fr: questionData.option3_fr,
              is_correct: questionData.option3_correct
            },
            {
              question_id: question.id,
              text: questionData.option4_en,
              text_en: questionData.option4_en,
              text_fr: questionData.option4_fr,
              is_correct: questionData.option4_correct
            },
            {
              question_id: question.id,
              text: questionData.option5_en,
              text_en: questionData.option5_en,
              text_fr: questionData.option5_fr,
              is_correct: questionData.option5_correct
            }
          ];

          const { error: optionsError } = await supabase
            .from('options')
            .insert(optionsData);

          if (optionsError) throw optionsError;

          processedCount++;
          setUploadProgress((processedCount / totalQuestions) * 100);
        } catch (error) {
          console.error('Error uploading question:', error);
          throw error;
        }
      }

      return processedCount;
    },
    onSuccess: (count) => {
      setIsUploading(false);
      setUploadProgress(100);
      setParsedQuestions([]);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(`Successfully uploaded ${count} questions`);
    },
    onError: (error) => {
      setIsUploading(false);
      console.error('Bulk upload error:', error);
      toast.error("Error uploading questions. Please try again.");
    }
  });

  const bulkUploadClinicalCasesMutation = useMutation({
    mutationFn: async (cases: BulkClinicalCase[]) => {
      setIsUploading(true);
      setUploadProgress(0);

      const totalCases = cases.length;
      const totalQuestions = cases.reduce((sum, c) => sum + c.questions.length, 0);
      let processedCases = 0;
      let processedQuestions = 0;

      for (const caseData of cases) {
        try {
          // Insert question group (clinical case)
          const { data: group, error: groupError } = await supabase
            .from('question_groups')
            .insert([{
              course_id: caseData.course_id,
              faculty_id: selectedFaculty === "null" ? null : selectedFaculty || null,
              title: caseData.title_en,
              title_en: caseData.title_en,
              title_fr: caseData.title_fr,
              description: caseData.description_en,
              description_en: caseData.description_en,
              description_fr: caseData.description_fr,
              order_index: caseData.order_index || 0
            }])
            .select()
            .single();

          if (groupError) throw groupError;

          // Insert questions for this group
          for (const questionData of caseData.questions) {
            // Insert question with group_id
            const { data: question, error: questionError } = await supabase
              .from('questions')
              .insert([{
                course_id: caseData.course_id,
                group_id: group.id,
                faculty_id: selectedFaculty === "null" ? null : selectedFaculty || null,
                text: questionData.text_en,
                text_en: questionData.text_en,
                text_fr: questionData.text_fr,
                explanation: questionData.explanation_en,
                explanation_en: questionData.explanation_en,
                explanation_fr: questionData.explanation_fr
              }])
              .select()
              .single();

            if (questionError) throw questionError;

            // Insert options for this question
            const optionsData = [
              {
                question_id: question.id,
                text: questionData.option1_en,
                text_en: questionData.option1_en,
                text_fr: questionData.option1_fr,
                is_correct: questionData.option1_correct
              },
              {
                question_id: question.id,
                text: questionData.option2_en,
                text_en: questionData.option2_en,
                text_fr: questionData.option2_fr,
                is_correct: questionData.option2_correct
              },
              {
                question_id: question.id,
                text: questionData.option3_en,
                text_en: questionData.option3_en,
                text_fr: questionData.option3_fr,
                is_correct: questionData.option3_correct
              },
              {
                question_id: question.id,
                text: questionData.option4_en,
                text_en: questionData.option4_en,
                text_fr: questionData.option4_fr,
                is_correct: questionData.option4_correct
              },
              {
                question_id: question.id,
                text: questionData.option5_en,
                text_en: questionData.option5_en,
                text_fr: questionData.option5_fr,
                is_correct: questionData.option5_correct
              }
            ];

            const { error: optionsError } = await supabase
              .from('options')
              .insert(optionsData);

            if (optionsError) throw optionsError;

            processedQuestions++;
            setUploadProgress((processedQuestions / totalQuestions) * 100);
          }
          
          processedCases++;
        } catch (error) {
          console.error('Error uploading clinical case:', error);
          throw error;
        }
      }

      return { cases: processedCases, questions: processedQuestions };
    },
    onSuccess: (result) => {
      setIsUploading(false);
      setUploadProgress(100);
      setParsedClinicalCases([]);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(`Successfully uploaded ${result.cases} clinical cases with ${result.questions} questions`);
    },
    onError: (error) => {
      setIsUploading(false);
      console.error('Bulk upload error:', error);
      toast.error("Error uploading clinical cases. Please try again.");
    }
  });

  const downloadTemplate = (type: 'questions' | 'clinicalCases') => {
    if (type === 'questions') {
      const headers = [
        'text_en', 'text_fr', 'explanation_en', 'explanation_fr',
        'option1_en', 'option1_fr', 'option1_correct',
        'option2_en', 'option2_fr', 'option2_correct',
        'option3_en', 'option3_fr', 'option3_correct',
        'option4_en', 'option4_fr', 'option4_correct',
        'option5_en', 'option5_fr', 'option5_correct'
      ];

      const sampleRow = [
        'What is the largest organ in the human body?',
        'Quel est le plus grand organe du corps humain?',
        'The skin is the largest organ of the human body.',
        'La peau est le plus grand organe du corps humain.',
        'Skin', 'Peau', 'true',
        'Heart', 'Cœur', 'false',
        'Liver', 'Foie', 'false',
        'Brain', 'Cerveau', 'false',
        'Lungs', 'Poumons', 'false'
      ];

      const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'question_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        'case_id', 'title_en', 'title_fr', 'description_en', 'description_fr', 'order_index',
        'text_en', 'text_fr', 'explanation_en', 'explanation_fr',
        'option1_en', 'option1_fr', 'option1_correct',
        'option2_en', 'option2_fr', 'option2_correct',
        'option3_en', 'option3_fr', 'option3_correct',
        'option4_en', 'option4_fr', 'option4_correct',
        'option5_en', 'option5_fr', 'option5_correct'
      ];

      const sampleRow1 = [
        'case1', 'Clinical Case: Abdominal Pain', 'Cas Clinique: Douleur Abdominale', 
        'A 45-year-old patient presents with severe abdominal pain.', 
        'Un patient de 45 ans présente des douleurs abdominales sévères.',
        '1',
        'What is the most likely diagnosis?', 'Quel est le diagnostic le plus probable?',
        'Acute appendicitis is the most common cause of acute abdominal pain.',
        'L\'appendicite aiguë est la cause la plus fréquente de douleur abdominale aiguë.',
        'Appendicitis', 'Appendicite', 'true',
        'Gastritis', 'Gastrite', 'false',
        'Pancreatitis', 'Pancréatite', 'false',
        'Cholecystitis', 'Cholécystite', 'false',
        'Diverticulitis', 'Diverticulite', 'false'
      ];

      const sampleRow2 = [
        'case1', 'Clinical Case: Abdominal Pain', 'Cas Clinique: Douleur Abdominale', 
        'A 45-year-old patient presents with severe abdominal pain.', 
        'Un patient de 45 ans présente des douleurs abdominales sévères.',
        '1',
        'Which test would be most appropriate initially?', 'Quel test serait le plus approprié initialement?',
        'CBC is typically the first test ordered for abdominal pain.',
        'La NFS est généralement le premier test commandé pour la douleur abdominale.',
        'Complete Blood Count', 'Numération Formule Sanguine', 'true',
        'CT Scan', 'Scanner', 'false',
        'MRI', 'IRM', 'false',
        'Ultrasound', 'Échographie', 'true',
        'Endoscopy', 'Endoscopie', 'false'
      ];

      const csvContent = [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clinical_case_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Bulk Question Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={uploadType} onValueChange={(val) => setUploadType(val as 'questions' | 'clinicalCases')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Individual Questions</TabsTrigger>
            <TabsTrigger value="clinicalCases">Clinical Cases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions" className="pt-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 mb-4">
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                <span className="text-sm">Download CSV template for individual questions</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('questions')}>
                Download Template
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="clinicalCases" className="pt-4">
            {/* Template Download for Clinical Cases */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 mb-4">
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                <span className="text-sm">Download CSV template for clinical cases</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('clinicalCases')}>
                Download Template
              </Button>
            </div>
            
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Clinical cases allow you to group multiple questions together under one scenario. 
                All questions with the same <strong>case_id</strong> will be grouped together.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Course and Faculty Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bulk-course">Select Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select course for questions" />
              </SelectTrigger>
              <SelectContent>
                {courses && courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title_en || course.title} / {course.title_fr || course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bulk-faculty">Faculty (Optional)</Label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No Faculty</SelectItem>
                {faculties && faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name_en || faculty.name} {faculty.university_name && `- ${faculty.university_name_en || faculty.university_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={!selectedCourse}
          />
          {!selectedCourse && (
            <p className="text-sm text-muted-foreground mt-1">
              Please select a course first
            </p>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Validation Errors:</div>
              <ul className="text-sm space-y-1">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {validationErrors.length > 5 && (
                  <li>• ... and {validationErrors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview for Questions */}
        {parsedQuestions.length > 0 && validationErrors.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Ready to Upload:</div>
              <p className="text-sm">
                {parsedQuestions.length} questions parsed successfully and ready for upload.
                {selectedFaculty && selectedFaculty !== "null" && (
                  <span> All questions will be associated with the selected faculty.</span>
                )}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview for Clinical Cases */}
        {parsedClinicalCases.length > 0 && validationErrors.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Ready to Upload:</div>
              <p className="text-sm">
                {parsedClinicalCases.length} clinical cases with {parsedClinicalCases.reduce((sum, c) => sum + c.questions.length, 0)} questions parsed successfully and ready for upload.
                {selectedFaculty && selectedFaculty !== "null" && (
                  <span> All cases will be associated with the selected faculty.</span>
                )}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Uploading {uploadType === 'questions' ? 'questions' : 'clinical cases'}...</span>
              <span className="text-sm">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        {uploadType === 'questions' ? (
          <Button
            onClick={() => bulkUploadMutation.mutate(parsedQuestions)}
            disabled={
              !selectedCourse || 
              parsedQuestions.length === 0 || 
              validationErrors.length > 0 || 
              isUploading
            }
            className="w-full"
          >
            {isUploading ? "Uploading..." : `Upload ${parsedQuestions.length} Questions`}
          </Button>
        ) : (
          <Button
            onClick={() => bulkUploadClinicalCasesMutation.mutate(parsedClinicalCases)}
            disabled={
              !selectedCourse || 
              parsedClinicalCases.length === 0 || 
              validationErrors.length > 0 || 
              isUploading
            }
            className="w-full"
          >
            {isUploading ? "Uploading..." : `Upload ${parsedClinicalCases.length} Clinical Cases`}
          </Button>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-medium">CSV Format Instructions:</h4>
          {uploadType === 'questions' ? (
            <ul className="space-y-1 pl-4">
              <li>• Use the provided template for correct column order</li>
              <li>• Set option_correct values to 'true' or 'false'</li>
              <li>• At least one option must be marked as correct per question</li>
              <li>• Both English (en) and French (fr) text required</li>
              <li>• Explanations are optional but recommended</li>
            </ul>
          ) : (
            <ul className="space-y-1 pl-4">
              <li>• Clinical cases group multiple questions under one scenario</li>
              <li>• Questions with the same case_id will be grouped together</li>
              <li>• Each case requires title, description, and at least one question</li>
              <li>• Set order_index to control the display order of cases</li>
              <li>• At least one option must be marked as correct per question</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
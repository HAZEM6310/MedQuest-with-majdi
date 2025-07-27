import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
}

interface BulkQuestionUploadProps {
  courses: any[];
}

export default function BulkQuestionUpload({ courses }: BulkQuestionUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [parsedQuestions, setParsedQuestions] = useState<BulkQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        parseCSVFile(file);
      } else {
        toast.error("Please select a CSV file");
      }
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
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
        'option4_en', 'option4_fr', 'option4_correct'
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

        const question: any = { course_id: selectedCourse };
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
          question.option4_correct
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
      setValidationErrors(errors);
      
      if (questions.length > 0) {
        toast.success(`Parsed ${questions.length} questions successfully`);
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

  const downloadTemplate = () => {
    const headers = [
      'text_en', 'text_fr', 'explanation_en', 'explanation_fr',
      'option1_en', 'option1_fr', 'option1_correct',
      'option2_en', 'option2_fr', 'option2_correct',
      'option3_en', 'option3_fr', 'option3_correct',
      'option4_en', 'option4_fr', 'option4_correct'
    ];

    const sampleRow = [
      'What is the largest organ in the human body?',
      'Quel est le plus grand organe du corps humain?',
      'The skin is the largest organ of the human body.',
      'La peau est le plus grand organe du corps humain.',
      'Skin', 'Peau', 'true',
      'Heart', 'Cœur', 'false',
      'Liver', 'Foie', 'false',
      'Brain', 'Cerveau', 'false'
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    URL.revokeObjectURL(url);
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
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">Download CSV template to get started</span>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            Download Template
          </Button>
        </div>

        {/* Course Selection */}
        <div>
          <Label htmlFor="bulk-course">Select Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select course for questions" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title_en || course.title} / {course.title_fr || course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Preview */}
        {parsedQuestions.length > 0 && validationErrors.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Ready to Upload:</div>
              <p className="text-sm">
                {parsedQuestions.length} questions parsed successfully and ready for upload.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Uploading questions...</span>
              <span className="text-sm">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
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

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-medium">CSV Format Instructions:</h4>
          <ul className="space-y-1 pl-4">
            <li>• Use the provided template for correct column order</li>
            <li>• Set option_correct values to 'true' or 'false'</li>
            <li>• At least one option must be marked as correct per question</li>
            <li>• Both English (en) and French (fr) text required</li>
            <li>• Explanations are optional but recommended</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
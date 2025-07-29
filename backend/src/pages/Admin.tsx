import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PlusCircle, Trash2, BookOpen, GraduationCap, FileText, Edit, Upload } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BulkQuestionUpload from "@/components/BulkQuestionUpload";

interface MultilingualYear {
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  order_index: number;
}

interface MultilingualSubject {
  year_id: string;
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  order_index: number;
}

interface MultilingualCourse {
  subject_id: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  category: string;
}

interface NewQuestion {
  course_id: string;
  text_en: string;
  text_fr: string;
  options: { text_en: string; text_fr: string; is_correct: boolean }[];
  explanation_en: string;
  explanation_fr: string;
}

export default function Admin() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // State for new items
  const [newYear, setNewYear] = useState<MultilingualYear>({ 
    name_en: "", name_fr: "", description_en: "", description_fr: "", order_index: 1 
  });
  const [newSubject, setNewSubject] = useState<MultilingualSubject>({ 
    year_id: "", name_en: "", name_fr: "", description_en: "", description_fr: "", order_index: 1 
  });
  const [newCourse, setNewCourse] = useState<MultilingualCourse>({ 
    subject_id: "", title_en: "", title_fr: "", description_en: "", description_fr: "", category: "" 
  });
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    course_id: "",
    text_en: "",
    text_fr: "",
    options: [
      { text_en: "", text_fr: "", is_correct: false }, 
      { text_en: "", text_fr: "", is_correct: false }, 
      { text_en: "", text_fr: "", is_correct: false }, 
      { text_en: "", text_fr: "", is_correct: false }
    ],
    explanation_en: "",
    explanation_fr: "",
  });
  const [editingYear, setEditingYear] = useState<null | (MultilingualYear & { id: string })>(null);
  const [editingSubject, setEditingSubject] = useState<null | (MultilingualSubject & { id: string })>(null);
  const [editingCourse, setEditingCourse] = useState<null | (MultilingualCourse & { id: string })>(null);

  // Fetch data
  const { data: yearsRaw = [] } = useQuery({
    queryKey: ['years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('years')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });
  const years: (MultilingualYear & { id: string })[] = Array.isArray(yearsRaw)
    ? yearsRaw.filter((y): y is MultilingualYear & { id: string } => !!y && typeof y === 'object' && 'id' in y)
    : [];

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data;
    }
  });

  // Mutations
  const addYearMutation = useMutation({
    mutationFn: async (year: MultilingualYear) => {
      const { data, error } = await supabase
        .from('years')
        .insert([{
          name: year.name_en, // Legacy field
          name_en: year.name_en,
          name_fr: year.name_fr,
          description: year.description_en, // Legacy field
          description_en: year.description_en,
          description_fr: year.description_fr,
          order_index: year.order_index
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      setNewYear({ name_en: "", name_fr: "", description_en: "", description_fr: "", order_index: 1 });
      toast.success("Year added successfully");
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (subject: MultilingualSubject) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          year_id: subject.year_id,
          name: subject.name_en, // Legacy field
          name_en: subject.name_en,
          name_fr: subject.name_fr,
          description: subject.description_en, // Legacy field
          description_en: subject.description_en,
          description_fr: subject.description_fr,
          order_index: subject.order_index
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setNewSubject({ year_id: "", name_en: "", name_fr: "", description_en: "", description_fr: "", order_index: 1 });
      toast.success("Subject added successfully");
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: async (course: MultilingualCourse) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          subject_id: course.subject_id,
          title: course.title_en, // Legacy field
          title_en: course.title_en,
          title_fr: course.title_fr,
          description: course.description_en, // Legacy field
          description_en: course.description_en,
          description_fr: course.description_fr,
          category: course.category
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setNewCourse({ subject_id: "", title_en: "", title_fr: "", description_en: "", description_fr: "", category: "" });
      toast.success("Course added successfully");
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (questionData: NewQuestion) => {
      // First, insert the question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert([{
          course_id: questionData.course_id,
          text: questionData.text_en, // Legacy field
          text_en: questionData.text_en,
          text_fr: questionData.text_fr,
          explanation: questionData.explanation_en, // Legacy field
          explanation_en: questionData.explanation_en,
          explanation_fr: questionData.explanation_fr
        }])
        .select()
        .single();

      if (questionError) throw questionError;

      // Then, insert the options
      const optionsData = questionData.options.map((option) => ({
        question_id: question.id,
        text: option.text_en, // Legacy field
        text_en: option.text_en,
        text_fr: option.text_fr,
        is_correct: option.is_correct
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      return question;
    },
    onSuccess: () => {
      setNewQuestion({
        course_id: "",
        text_en: "",
        text_fr: "",
        options: [
          { text_en: "", text_fr: "", is_correct: false }, 
          { text_en: "", text_fr: "", is_correct: false }, 
          { text_en: "", text_fr: "", is_correct: false }, 
          { text_en: "", text_fr: "", is_correct: false }
        ],
        explanation_en: "",
        explanation_fr: "",
      });
      toast.success("Question added successfully");
    },
  });

  const updateYearMutation = useMutation({
    mutationFn: async (year) => {
      const { error } = await supabase
        .from('years')
        .update({
          name: year.name_en, // Legacy field
          name_en: year.name_en,
          name_fr: year.name_fr,
          description: year.description_en, // Legacy field
          description_en: year.description_en,
          description_fr: year.description_fr,
          order_index: year.order_index
        })
        .eq('id', year.id);
      if (error) throw error;
      return year;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Year updated successfully');
    },
  });
  const deleteYearMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('years').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Year deleted successfully');
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (subject) => {
      const { error } = await supabase
        .from('subjects')
        .update({
          year_id: subject.year_id,
          name: subject.name_en, // Legacy field
          name_en: subject.name_en,
          name_fr: subject.name_fr,
          description: subject.description_en, // Legacy field
          description_en: subject.description_en,
          description_fr: subject.description_fr,
          order_index: subject.order_index
        })
        .eq('id', subject.id);
      if (error) throw error;
      return subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (course) => {
      const { error } = await supabase
        .from('courses')
        .update({
          subject_id: course.subject_id,
          title: course.title_en, // Legacy field
          title_en: course.title_en,
          title_fr: course.title_fr,
          description: course.description_en, // Legacy field
          description_en: course.description_en,
          description_fr: course.description_fr,
          category: course.category
        })
        .eq('id', course.id);
      if (error) throw error;
      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
  });

  const handleOptionChange = (index: number, field: 'text_en' | 'text_fr', value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], is_correct: isCorrect };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { text_en: "", text_fr: "", is_correct: false }]
    });
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions
      });
    }
  };

  const hasCorrectAnswer = newQuestion.options.some(option => option.is_correct);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('admin.title')}</h1>
        <p className="text-muted-foreground">Comprehensive multilingual content management system</p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="content">{t('admin.manageContent')}</TabsTrigger>
          <TabsTrigger value="courses">Course Sections</TabsTrigger>
          <TabsTrigger value="questions">{t('admin.addQuestion')}</TabsTrigger>
          <TabsTrigger value="bulk-upload">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="edit">{t('admin.editContent')}</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Year */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {t('admin.addYear')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="year-name-en">Name (EN)</Label>
                    <Input
                      id="year-name-en"
                      value={newYear.name_en}
                      onChange={(e) => setNewYear({...newYear, name_en: e.target.value})}
                      placeholder="1st Year Medicine"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year-name-fr">Name (FR)</Label>
                    <Input
                      id="year-name-fr"
                      value={newYear.name_fr}
                      onChange={(e) => setNewYear({...newYear, name_fr: e.target.value})}
                      placeholder="1ère Année Médecine"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="year-desc-en">Description (EN)</Label>
                    <Textarea
                      id="year-desc-en"
                      value={newYear.description_en}
                      onChange={(e) => setNewYear({...newYear, description_en: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year-desc-fr">Description (FR)</Label>
                    <Textarea
                      id="year-desc-fr"
                      value={newYear.description_fr}
                      onChange={(e) => setNewYear({...newYear, description_fr: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="year-order">Order</Label>
                  <Input
                    id="year-order"
                    type="number"
                    value={newYear.order_index}
                    onChange={(e) => setNewYear({...newYear, order_index: parseInt(e.target.value)})}
                  />
                </div>
                <Button 
                  onClick={() => addYearMutation.mutate(newYear)}
                  disabled={!newYear.name_en || !newYear.name_fr || addYearMutation.isPending}
                  className="w-full"
                >
                  {addYearMutation.isPending ? t('ui.loading') : 'Add Year'}
                </Button>
              </CardContent>
            </Card>

            {/* Add Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('admin.addSubject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject-year">Year</Label>
                  <Select value={newSubject.year_id} onValueChange={(value) => setNewSubject({...newSubject, year_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name_en || year.name} / {year.name_fr || year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="subject-name-en">Name (EN)</Label>
                    <Input
                      id="subject-name-en"
                      value={newSubject.name_en}
                      onChange={(e) => setNewSubject({...newSubject, name_en: e.target.value})}
                      placeholder="Anatomy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject-name-fr">Name (FR)</Label>
                    <Input
                      id="subject-name-fr"
                      value={newSubject.name_fr}
                      onChange={(e) => setNewSubject({...newSubject, name_fr: e.target.value})}
                      placeholder="Anatomie"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="subject-desc-en">Description (EN)</Label>
                    <Textarea
                      id="subject-desc-en"
                      value={newSubject.description_en}
                      onChange={(e) => setNewSubject({...newSubject, description_en: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject-desc-fr">Description (FR)</Label>
                    <Textarea
                      id="subject-desc-fr"
                      value={newSubject.description_fr}
                      onChange={(e) => setNewSubject({...newSubject, description_fr: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => addSubjectMutation.mutate(newSubject)}
                  disabled={!newSubject.year_id || !newSubject.name_en || !newSubject.name_fr || addSubjectMutation.isPending}
                  className="w-full"
                >
                  {addSubjectMutation.isPending ? t('ui.loading') : 'Add Subject'}
                </Button>
              </CardContent>
            </Card>

            {/* Add Course */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {t('admin.addCourse')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-subject">Subject</Label>
                  <Select value={newCourse.subject_id} onValueChange={(value) => setNewCourse({...newCourse, subject_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name_en || subject.name} / {subject.name_fr || subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="course-title-en">Title (EN)</Label>
                    <Input
                      id="course-title-en"
                      value={newCourse.title_en}
                      onChange={(e) => setNewCourse({...newCourse, title_en: e.target.value})}
                      placeholder="Cardiovascular System"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-title-fr">Title (FR)</Label>
                    <Input
                      id="course-title-fr"
                      value={newCourse.title_fr}
                      onChange={(e) => setNewCourse({...newCourse, title_fr: e.target.value})}
                      placeholder="Système Cardiovasculaire"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="course-desc-en">Description (EN)</Label>
                    <Textarea
                      id="course-desc-en"
                      value={newCourse.description_en}
                      onChange={(e) => setNewCourse({...newCourse, description_en: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-desc-fr">Description (FR)</Label>
                    <Textarea
                      id="course-desc-fr"
                      value={newCourse.description_fr}
                      onChange={(e) => setNewCourse({...newCourse, description_fr: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="course-category">Category</Label>
                  <Input
                    id="course-category"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                    placeholder="e.g., System Anatomy"
                  />
                </div>
                <Button 
                  onClick={() => addCourseMutation.mutate(newCourse)}
                  disabled={!newCourse.subject_id || !newCourse.title_en || !newCourse.title_fr || addCourseMutation.isPending}
                  className="w-full"
                >
                  {addCourseMutation.isPending ? t('ui.loading') : 'Add Course'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Add Multilingual Question (Multiple Correct Answers Supported)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="question-course">Course</Label>
                <Select value={newQuestion.course_id} onValueChange={(value) => setNewQuestion({...newQuestion, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question-text-en">Question Text (English) *</Label>
                  <Textarea
                    id="question-text-en"
                    placeholder="Enter question text in English..."
                    value={newQuestion.text_en}
                    onChange={(e) => setNewQuestion({...newQuestion, text_en: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="question-text-fr">Question Text (French) *</Label>
                  <Textarea
                    id="question-text-fr"
                    placeholder="Enter question text in French..."
                    value={newQuestion.text_fr}
                    onChange={(e) => setNewQuestion({...newQuestion, text_fr: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Answer Options (Check all correct answers) *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Checkbox
                          checked={option.is_correct}
                          onCheckedChange={(checked) => handleOptionCorrectChange(index, !!checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium w-6">
                          {String.fromCharCode(65 + index)}:
                        </span>
                      </div>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)} (EN)`}
                        value={option.text_en}
                        onChange={(e) => handleOptionChange(index, 'text_en', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)} (FR)`}
                        value={option.text_fr}
                        onChange={(e) => handleOptionChange(index, 'text_fr', e.target.value)}
                        className="flex-1"
                      />
                      {newQuestion.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {!hasCorrectAnswer && (
                  <p className="text-sm text-red-500 mt-2">Please select at least one correct answer</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="explanation-en">Explanation (English)</Label>
                  <Textarea
                    id="explanation-en"
                    placeholder="Explanation for the correct answer in English..."
                    value={newQuestion.explanation_en}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation_en: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="explanation-fr">Explanation (French)</Label>
                  <Textarea
                    id="explanation-fr"
                    placeholder="Explanation for the correct answer in French..."
                    value={newQuestion.explanation_fr}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation_fr: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              <Button 
                onClick={() => addQuestionMutation.mutate(newQuestion)}
                disabled={!newQuestion.course_id || !newQuestion.text_en || !newQuestion.text_fr || 
                  newQuestion.options.some(opt => !opt.text_en.trim() || !opt.text_fr.trim()) || 
                  !hasCorrectAnswer || addQuestionMutation.isPending}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                {addQuestionMutation.isPending ? t('ui.loading') : 'Add Multilingual Question'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload">
          <BulkQuestionUpload courses={courses} />
        </TabsContent>

        {/* Course Sections Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Sections (Amboss-style)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create comprehensive course sections with rich content, similar to Amboss medical learning platform.
              </p>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Course sections implementation coming soon...</p>
                <p className="text-xs text-muted-foreground mt-2">Will include: Rich text editor, image uploads, interactive content, and multilingual support</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Content Tab */}
        <TabsContent value="edit">
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('admin.editContent')}</h2>
              <p className="text-muted-foreground">Manage and edit all content in your medical education platform</p>
            </div>

            <Tabs defaultValue="edit-years" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit-years">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Edit Years
                </TabsTrigger>
                <TabsTrigger value="edit-subjects">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Edit Subjects
                </TabsTrigger>
                <TabsTrigger value="edit-courses">
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Courses
                </TabsTrigger>
              </TabsList>

              {/* Edit Years */}
              <TabsContent value="edit-years">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Edit Years
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {years.map((year) => (
                        <div key={year.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                          <div className="flex-1">
                            <div className="font-bold">{year.name_en} / {year.name_fr}</div>
                            <div className="text-sm text-muted-foreground">{year.description_en} / {year.description_fr}</div>
                            <div className="text-xs text-muted-foreground">Order: {year.order_index}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => year && setEditingYear(year)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Subjects */}
              <TabsContent value="edit-subjects">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Edit Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subjects.map((subject) => {
                        const parentYear = years.find(y => y.id === subject.year_id);
                        return (
                          <div key={subject.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                            <div className="flex-1">
                              <div className="font-bold">{subject.name_en || subject.name} / {subject.name_fr || subject.name}</div>
                              <div className="text-sm text-muted-foreground">{subject.description_en || subject.description} / {subject.description_fr || subject.description}</div>
                              <div className="text-xs text-muted-foreground">
                                Year: {parentYear ? `${parentYear.name_en} / ${parentYear.name_fr}` : 'Unknown'} | Order: {subject.order_index}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => subject && setEditingSubject({
                              ...subject,
                              year_id: subject.year_id,
                              name_en: subject.name_en || subject.name || '',
                              name_fr: subject.name_fr || subject.name || '',
                              description_en: subject.description_en || subject.description || '',
                              description_fr: subject.description_fr || subject.description || '',
                              order_index: subject.order_index || 1
                            })}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Courses */}
              <TabsContent value="edit-courses">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Edit Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.map((course) => {
                        const parentSubject = subjects.find(s => s.id === course.subject_id);
                        return (
                          <div key={course.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                            <div className="flex-1">
                              <div className="font-bold">{course.title_en || course.title} / {course.title_fr || course.title}</div>
                              <div className="text-sm text-muted-foreground">{course.description_en || course.description} / {course.description_fr || course.description}</div>
                              <div className="text-xs text-muted-foreground">
                                Subject: {parentSubject ? `${parentSubject.name_en || parentSubject.name} / ${parentSubject.name_fr || parentSubject.name}` : 'Unknown'} | Category: {course.category}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => course && setEditingCourse({
                              ...course,
                              subject_id: course.subject_id,
                              title_en: course.title_en || course.title || '',
                              title_fr: course.title_fr || course.title || '',
                              description_en: course.description_en || course.description || '',
                              description_fr: course.description_fr || course.description || '',
                              category: course.category || ''
                            })}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Edit Year Modal */}
          {editingYear && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditingYear(null)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Edit Year</h2>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Name (EN)</Label>
                    <Input value={editingYear.name_en} onChange={e => setEditingYear({ ...editingYear, name_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Name (FR)</Label>
                    <Input value={editingYear.name_fr} onChange={e => setEditingYear({ ...editingYear, name_fr: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Description (EN)</Label>
                    <Textarea value={editingYear.description_en} onChange={e => setEditingYear({ ...editingYear, description_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description (FR)</Label>
                    <Textarea value={editingYear.description_fr} onChange={e => setEditingYear({ ...editingYear, description_fr: e.target.value })} />
                  </div>
                </div>
                <div className="mb-2">
                  <Label>Order</Label>
                  <Input type="number" value={editingYear.order_index} onChange={e => setEditingYear({ ...editingYear, order_index: parseInt(e.target.value) })} />
                </div>
                <Button onClick={() => { if (editingYear) { updateYearMutation.mutate(editingYear); setEditingYear(null); } }} className="w-full mt-2">Save</Button>
                <Button onClick={() => { if (editingYear) { deleteYearMutation.mutate(editingYear.id); setEditingYear(null); } }} variant="destructive" className="w-full mt-2">Delete</Button>
              </div>
            </div>
          )}

          {/* Edit Subject Modal */}
          {editingSubject && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditingSubject(null)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
                <div className="mb-2">
                  <Label>Year</Label>
                  <Select value={editingSubject.year_id} onValueChange={(value) => setEditingSubject({...editingSubject, year_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name_en || year.name} / {year.name_fr || year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Name (EN)</Label>
                    <Input value={editingSubject.name_en} onChange={e => setEditingSubject({ ...editingSubject, name_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Name (FR)</Label>
                    <Input value={editingSubject.name_fr} onChange={e => setEditingSubject({ ...editingSubject, name_fr: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Description (EN)</Label>
                    <Textarea value={editingSubject.description_en} onChange={e => setEditingSubject({ ...editingSubject, description_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description (FR)</Label>
                    <Textarea value={editingSubject.description_fr} onChange={e => setEditingSubject({ ...editingSubject, description_fr: e.target.value })} />
                  </div>
                </div>
                <div className="mb-2">
                  <Label>Order</Label>
                  <Input type="number" value={editingSubject.order_index} onChange={e => setEditingSubject({ ...editingSubject, order_index: parseInt(e.target.value) })} />
                </div>
                <Button onClick={() => { if (editingSubject) { updateSubjectMutation.mutate(editingSubject); setEditingSubject(null); } }} className="w-full mt-2">Save</Button>
                <Button onClick={() => { if (editingSubject) { deleteSubjectMutation.mutate(editingSubject.id); setEditingSubject(null); } }} variant="destructive" className="w-full mt-2">Delete</Button>
              </div>
            </div>
          )}

          {/* Edit Course Modal */}
          {editingCourse && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditingCourse(null)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Edit Course</h2>
                <div className="mb-2">
                  <Label>Subject</Label>
                  <Select value={editingCourse.subject_id} onValueChange={(value) => setEditingCourse({...editingCourse, subject_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name_en || subject.name} / {subject.name_fr || subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Title (EN)</Label>
                    <Input value={editingCourse.title_en} onChange={e => setEditingCourse({ ...editingCourse, title_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Title (FR)</Label>
                    <Input value={editingCourse.title_fr} onChange={e => setEditingCourse({ ...editingCourse, title_fr: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Description (EN)</Label>
                    <Textarea value={editingCourse.description_en} onChange={e => setEditingCourse({ ...editingCourse, description_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description (FR)</Label>
                    <Textarea value={editingCourse.description_fr} onChange={e => setEditingCourse({ ...editingCourse, description_fr: e.target.value })} />
                  </div>
                </div>
                <div className="mb-2">
                  <Label>Category</Label>
                  <Input value={editingCourse.category} onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })} />
                </div>
                <Button onClick={() => { if (editingCourse) { updateCourseMutation.mutate(editingCourse); setEditingCourse(null); } }} className="w-full mt-2">Save</Button>
                <Button onClick={() => { if (editingCourse) { deleteCourseMutation.mutate(editingCourse.id); setEditingCourse(null); } }} variant="destructive" className="w-full mt-2">Delete</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Question Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Question reports management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

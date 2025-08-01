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
import { PlusCircle, Trash2, BookOpen, GraduationCap, FileText, Edit, Upload, CreditCard, Download } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BulkQuestionUpload from "@/components/BulkQuestionUpload";
import { VoucherManagement } from "@/components/VoucherManagement";
import FacultyManagement from "@/components/FacultyManagement";
import { useEffect } from "react";

// Define interfaces for strong typing
interface Year {
  id: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  order_index: number;
}

interface Subject {
  id: string;
  year_id: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  order_index: number;
}

interface Course {
  id: string;
  subject_id: string;
  title: string;
  title_en?: string;
  title_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  category?: string;
}

interface Question {
  id: string;
  course_id: string;
  faculty_id?: string;
  text: string;
  text_en?: string;
  text_fr?: string;
  explanation?: string;
  explanation_en?: string;
  explanation_fr?: string;
  options: Option[];
}

interface Option {
  id: string;
  question_id: string;
  text: string;
  text_en?: string;
  text_fr?: string;
  is_correct: boolean;
}

interface Faculty {
  id: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  university_name?: string;
  university_name_en?: string;
  university_name_fr?: string;
  is_active: boolean;
  order_index: number;
}

interface EditQuestion {
  id: string;
  text_en: string;
  text_fr: string;
  explanation_en: string;
  explanation_fr: string;
  options: Option[];
}

export default function Admin() {
  // State for Edit Tab selection and editing
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [editQuestion, setEditQuestion] = useState<EditQuestion | null>(null);

  // Fetch questions for selected course
  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["questions", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const { data, error } = await supabase
        .from("questions")
        .select("*, options(*)")
        .eq("course_id", selectedCourseId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourseId,
  });

  // Find selected question
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  // When selectedQuestion changes, update editQuestion state
  useEffect(() => {
    if (selectedQuestion) {
      setEditQuestion({
        id: selectedQuestion.id,
        text_en: selectedQuestion.text_en || selectedQuestion.text || "",
        text_fr: selectedQuestion.text_fr || "",
        explanation_en: selectedQuestion.explanation_en || selectedQuestion.explanation || "",
        explanation_fr: selectedQuestion.explanation_fr || "",
        options: selectedQuestion.options || [],
      });
    } else {
      setEditQuestion(null);
    }
  }, [selectedQuestionId, questions]);

  // Option handlers for editQuestion
  const handleEditOptionChange = (idx: number, field: string, value: string) => {
    if (!editQuestion) return;
    const updated = [...editQuestion.options];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditQuestion({ ...editQuestion, options: updated });
  };
  
  const handleEditOptionCorrectChange = (idx: number, isCorrect: boolean) => {
    if (!editQuestion) return;
    const updated = [...editQuestion.options];
    updated[idx] = { ...updated[idx], is_correct: isCorrect };
    setEditQuestion({ ...editQuestion, options: updated });
  };

  // Save and Delete handlers
  const saveEditMutation = useMutation({
    mutationFn: async (q: EditQuestion) => {
      // Update question
      const { error: qErr } = await supabase
        .from("questions")
        .update({
          text: q.text_en, // Legacy field
          text_en: q.text_en,
          text_fr: q.text_fr,
          explanation: q.explanation_en, // Legacy field
          explanation_en: q.explanation_en,
          explanation_fr: q.explanation_fr,
        })
        .eq("id", q.id);
      if (qErr) throw qErr;
      
      // Update options
      for (const opt of q.options) {
        await supabase
          .from("options")
          .update({
            text: opt.text_en, // Legacy field
            text_en: opt.text_en,
            text_fr: opt.text_fr,
            is_correct: opt.is_correct,
          })
          .eq("id", opt.id);
      }
      return q;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedCourseId] });
      toast.success("Question updated successfully");
    },
  });
  
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("options").delete().eq("question_id", id);
      await supabase.from("questions").delete().eq("id", id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedCourseId] });
      setSelectedQuestionId("");
      toast.success("Question deleted successfully");
    },
  });
  
  const handleSaveEditQuestion = () => {
    if (editQuestion) saveEditMutation.mutate(editQuestion);
  };
  
  const handleDeleteQuestion = () => {
    if (editQuestion) deleteQuestionMutation.mutate(editQuestion.id);
  };
  
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // State for new items
  const [newYear, setNewYear] = useState({ 
    name_en: "", 
    name_fr: "", 
    description_en: "", 
    description_fr: "", 
    order_index: 1 
  });
  
  const [newSubject, setNewSubject] = useState({ 
    year_id: "", 
    name_en: "", 
    name_fr: "", 
    description_en: "", 
    description_fr: "", 
    order_index: 1 
  });
  
  const [newCourse, setNewCourse] = useState({ 
    subject_id: "", 
    title_en: "", 
    title_fr: "", 
    description_en: "", 
    description_fr: "", 
    category: "" 
  });
  
  const [newQuestion, setNewQuestion] = useState({
    course_id: "",
    faculty_id: "",
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
  
  const [editingYear, setEditingYear] = useState<null | (Year & { id: string })>(null);

  // Fetch data
  const { data: years = [] } = useQuery<Year[]>({
    queryKey: ['years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('years')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: faculties = [] } = useQuery<Faculty[]>({
    queryKey: ['faculties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data || [];
    }
  });

  // Mutations
  const addYearMutation = useMutation({
    mutationFn: async (year: typeof newYear) => {
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
    mutationFn: async (subject: typeof newSubject) => {
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
    mutationFn: async (course: typeof newCourse) => {
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
    mutationFn: async (questionData: typeof newQuestion) => {
      // First, insert the question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert([{
          course_id: questionData.course_id,
          faculty_id: questionData.faculty_id === "null" ? null : questionData.faculty_id || null,
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
        faculty_id: "",
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
    mutationFn: async (year: Year) => {
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('years').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Year deleted successfully');
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="content">{t('admin.manageContent')}</TabsTrigger>
          <TabsTrigger value="courses">Course Sections</TabsTrigger>
          <TabsTrigger value="questions">{t('admin.addQuestion')}</TabsTrigger>
          <TabsTrigger value="bulk-upload">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="edit">{t('admin.editContent')}</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="vouchers">
            <CreditCard className="h-4 w-4 mr-2" />
            Vouchers
          </TabsTrigger>
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
                    onChange={(e) => setNewYear({...newYear, order_index: parseInt(e.target.value) || 1})}
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="question-faculty">Faculty (Optional)</Label>
                  <Select value={newQuestion.faculty_id} onValueChange={(value) => setNewQuestion({...newQuestion, faculty_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No Faculty</SelectItem>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name_en || faculty.name} {faculty.university_name && `- ${faculty.university_name_en || faculty.university_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
          <BulkQuestionUpload courses={courses} faculties={faculties} />
        </TabsContent>

        {/* Faculties Tab */}
        <TabsContent value="faculties">
          <FacultyManagement />
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
          <Card>
            <CardHeader>
              <CardTitle>Edit Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Step 1: Select Year */}
                <div>
                  <Label>Select Year</Label>
                  <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.id} value={year.id}>{year.name_en || year.name} / {year.name_fr || year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Step 2: Select Subject */}
                {selectedYearId && (
                  <div>
                    <Label>Select Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => s.year_id === selectedYearId).map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name_en || subject.name} / {subject.name_fr || subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Step 3: Select Course */}
                {selectedSubjectId && (
                  <div>
                    <Label>Select Course</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.filter(c => c.subject_id === selectedSubjectId).map(course => (
                          <SelectItem key={course.id} value={course.id}>{course.title_en || course.title} / {course.title_fr || course.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Step 4: Select Question */}
                {selectedCourseId && (
                  <div>
                    <Label>Select Question</Label>
                    <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose question" />
                      </SelectTrigger>
                      <SelectContent>
                        {questions.filter(q => q.course_id === selectedCourseId).map((question, idx) => (
                          <SelectItem key={question.id} value={question.id}>Question {idx + 1}: {question.text_en?.slice(0, 40) || question.text?.slice(0, 40)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Step 5: Edit Question Form */}
                {selectedQuestion && editQuestion && (
                  <div className="mt-6 border rounded p-4">
                    <h3 className="font-bold mb-2">Edit Question</h3>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <Label>Text (EN)</Label>
                        <Textarea value={editQuestion.text_en} onChange={e => setEditQuestion({ ...editQuestion, text_en: e.target.value })} />
                      </div>
                      <div>
                        <Label>Text (FR)</Label>
                        <Textarea value={editQuestion.text_fr} onChange={e => setEditQuestion({ ...editQuestion, text_fr: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <Label>Explanation (EN)</Label>
                        <Textarea value={editQuestion.explanation_en} onChange={e => setEditQuestion({ ...editQuestion, explanation_en: e.target.value })} />
                      </div>
                      <div>
                        <Label>Explanation (FR)</Label>
                        <Textarea value={editQuestion.explanation_fr} onChange={e => setEditQuestion({ ...editQuestion, explanation_fr: e.target.value })} />
                      </div>
                    </div>
                    <div className="mb-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {editQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Checkbox checked={option.is_correct} onCheckedChange={checked => handleEditOptionCorrectChange(idx, !!checked)} />
                            <Input value={option.text_en || ""} onChange={e => handleEditOptionChange(idx, 'text_en', e.target.value)} placeholder={`Option ${String.fromCharCode(65 + idx)} (EN)`} />
                            <Input value={option.text_fr || ""} onChange={e => handleEditOptionChange(idx, 'text_fr', e.target.value)} placeholder={`Option ${String.fromCharCode(65 + idx)} (FR)`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveEditQuestion} className="w-full">Save</Button>
                      <Button onClick={handleDeleteQuestion} variant="destructive" className="w-full">Delete</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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

        {/* Voucher Management Tab */}
        <TabsContent value="vouchers">
          <VoucherManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Course, Subject } from "@/types";
import { ArrowLeft, BookOpen, Lock, Unlock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function SubjectCourses() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    fetchSubjectAndCourses();
  }, [subjectId]);

  const fetchSubjectAndCourses = async () => {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch courses with is_free field
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>{t('course.loading')}</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-xl font-bold mb-4">{t('course.notFound')}</h2>
        <Button onClick={() => navigate('/')}>
          {t('course.backHome')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('ui.back')}
        </Button>
        
        <h1 className="text-3xl font-bold">
          {getLocalizedText(subject.name_en, subject.name_fr, subject.name)}
        </h1>
        {subject.description && (
          <p className="text-muted-foreground mt-2">
            {getLocalizedText(subject.description_en, subject.description_fr, subject.description)}
          </p>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('course.noQuestions')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link to={`/courses/${course.id}`} key={course.id}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getLocalizedText(course.title_en, course.title_fr, course.title)}
                    </CardTitle>
                    {course.is_free ? (
                      <Unlock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <CardDescription>
                    {getLocalizedText(course.description_en, course.description_fr, course.description)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {course.question_count} {t('course.questions')}
                    </Badge>
                    {course.is_free && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Free
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

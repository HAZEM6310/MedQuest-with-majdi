import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types';

interface QuizProgressWithCourse {
  id: string;
  user_id: string;
  course_id: string;
  current_question: number;
  user_answers: { [key: string]: string[] };
  score: number;
  questions_answered: number;
  wrong_answers: string[];
  is_completed: boolean;
  final_grade?: number;
  created_at: string;
  updated_at: string;
  course: Course;
}

export default function IncompleteQuizzes() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [incompleteQuizzes, setIncompleteQuizzes] = useState<QuizProgressWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIncompleteQuizzes();
    }
  }, [user]);

  const fetchIncompleteQuizzes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_progress')
        .select(`
          *,
          courses!inner (*)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const quizzesWithCourses = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        course_id: item.course_id,
        current_question: item.current_question || 0,
        user_answers: typeof item.user_answers === 'object' && item.user_answers !== null 
          ? item.user_answers as { [key: string]: string[] }
          : {},
        score: item.score || 0,
        questions_answered: item.questions_answered || 0,
        wrong_answers: Array.isArray(item.wrong_answers) ? item.wrong_answers : [],
        is_completed: item.is_completed || false,
        final_grade: item.final_grade,
        created_at: item.created_at,
        updated_at: item.updated_at,
        course: item.courses as Course
      }));
      
      setIncompleteQuizzes(quizzesWithCourses);
    } catch (error) {
      console.error('Error fetching incomplete quizzes:', error);
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

  const handleContinueQuiz = (courseId: string) => {
    navigate(`/courses/${courseId}/quiz`);
  };

  if (loading || incompleteQuizzes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5" />
          Incomplete Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {incompleteQuizzes.map((quiz) => (
              <Card 
                key={quiz.id} 
                className="min-w-[280px] cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleContinueQuiz(quiz.course_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="h-4 w-4 text-blue-500 mt-1" />
                    <span className="text-xs text-gray-500">
                      {Math.round((quiz.current_question / quiz.course.question_count) * 100)}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-800">
                    {getLocalizedText(quiz.course.title_en, quiz.course.title_fr, quiz.course.title)}
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Question {quiz.current_question + 1} of {quiz.course.question_count}
                  </p>
                  <Button size="sm" className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

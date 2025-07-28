import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Course, Question } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { theme } = useTheme();
  const themeConfig = {
    purple: {
      primary: '250 45% 60%',
      secondary: '250 30% 45%',
      accent: '250 46% 96%',
      sidebar: '250 46% 97%',
      sidebarAccent: '250 46% 94%',
    },
    blue: {
      primary: '200 45% 70%',
      secondary: '200 30% 55%',
      accent: '200 45% 95%',
      sidebar: '200 46% 97%',
      sidebarAccent: '200 46% 94%',
    },
    caramel: {
      primary: '30 45% 50%',
      secondary: '30 30% 35%',
      accent: '30 45% 95%',
      sidebar: '30 46% 97%',
      sidebarAccent: '30 46% 94%',
    },
    pinky: {
      primary: '340 45% 70%',
      secondary: '340 30% 55%',
      accent: '340 20% 94%',
      sidebar: '340 20% 97%',
      sidebarAccent: '340 20% 91%',
    },
    lollipop: {
      primary: '174 50% 50%',
      secondary: '174 35% 35%',
      accent: '174 50% 96%',
      sidebar: '174 50% 97%',
      sidebarAccent: '174 50% 94%',
    },
    aesthetic: {
      primary: '220 70% 60%',
      secondary: '250 90% 70%',
      accent: '230 40% 95%',
      sidebar: '230 40% 97%',
      sidebarAccent: '230 40% 91%',
    },
  };
  const bookBg = themeConfig[theme]?.primary || '250 45% 60%';
  const coverBg = themeConfig[theme]?.accent || '250 46% 96%';

  useEffect(() => {
    if (!courseId) return;
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const getLocalizedText = (enText?: string, frText?: string, fallback?: string) =>
    language === "en" ? enText ?? fallback ?? "" : frText ?? fallback ?? "";

  if (!course) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("course.notFound")}</h1>
        <Link to="/courses">
          <button className="px-4 py-2 rounded bg-secondary text-white font-semibold">{t("ui.back")}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background">
      <style>{`
        .book {
          position: relative;
          border-radius: 10px;
          width: 260px;
          height: 340px;
          background: hsl(${bookBg});
          box-shadow: 1px 1px 12px #000;
          transform: preserve-3d;
          perspective: 2000px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
        }
        .cover {
          top: 0;
          position: absolute;
          background: hsl(${coverBg});
          width: 100%;
          height: 100%;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.5s;
          transform-origin: 0;
          box-shadow: 1px 1px 12px #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .book:hover .cover {
          transition: all 0.5s;
          transform: rotatey(-80deg);
        }
        .book-title {
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          margin: 0 10px;
        }
        .book-questions {
          font-size: 1.1rem;
          font-weight: 500;
          text-align: center;
          margin-top: 1.5rem;
        }
        .cover-content {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }
      `}</style>
      <div className="book">
        <div>
          <div className="book-title">
            {getLocalizedText(course.title_en, course.title_fr, course.title)}
          </div>
          <div className="book-questions">
            {questions.length} {t('course.totalQuestions')}
          </div>
        </div>
        <div className="cover">
          <div className="cover-content">
            {t('quiz.startQuiz')}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Course, Question, Faculty } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSearchParams } from "react-router-dom";

export default function CourseDetail() {
  const [searchParams] = useSearchParams();
  const facultyParam = searchParams.get('faculty');
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  
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
  useEffect(() => {
    if (facultyParam) {
      setSelectedFacultyId(facultyParam);
    }
  }, [facultyParam]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch questions with their faculty information
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, faculty:faculty_id(*)')
        .eq('course_id', courseId);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Extract unique faculties from questions
      const uniqueFaculties = new Map();
      questionsData?.forEach(question => {
        if (question.faculty) {
          uniqueFaculties.set(question.faculty.id, question.faculty);
        }
      });
      
      // Get all active faculties for this course
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .eq('is_active', true);
        
      if (facultiesError) throw facultiesError;
      
      // Only include faculties that have questions in this course
      const courseFaculties = facultiesData?.filter(
        faculty => [...uniqueFaculties.keys()].includes(faculty.id)
      ) || [];
      
      setFaculties(courseFaculties);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (enText?: string, frText?: string, fallback?: string) =>
    language === "en" ? enText ?? fallback ?? "" : frText ?? fallback ?? "";

  const getFilteredQuestions = () => {
    if (selectedFacultyId === "all") {
      return questions;
    }
    return questions.filter(q => q.faculty_id === selectedFacultyId);
  };

  const startQuiz = () => {
  // Navigate to the correct quiz URL path
  navigate(`/courses/${courseId}/quiz${selectedFacultyId !== "all" ? `?faculty=${selectedFacultyId}` : ''}`);
};

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("ui.loading")}...</h1>
      </div>
    );
  }

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

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="w-full max-w-2xl px-4 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          {getLocalizedText(course.title_en, course.title_fr, course.title)}
        </h1>
        
        {course.description && (
          <p className="text-center text-muted-foreground mb-6">
            {getLocalizedText(course.description_en, course.description_fr, course.description)}
          </p>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">{t('faculty.select')}</label>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedFacultyId === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => setSelectedFacultyId("all")}
            >
              {t('faculty.all')}
            </button>
            
            {faculties.map(faculty => (
              <button
                key={faculty.id}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedFacultyId === faculty.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => setSelectedFacultyId(faculty.id)}
              >
                {getLocalizedText(faculty.name_en, faculty.name_fr, faculty.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
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
        
        <div className="book" onClick={startQuiz}>
          <div>
            <div className="book-title">
              {getLocalizedText(course.title_en, course.title_fr, course.title)}
            </div>
            <div className="book-questions">
              {filteredQuestions.length} {t('course.totalQuestions')}
              {selectedFacultyId !== "all" && (
                <div className="text-sm mt-1">
                  {t('faculty.filtered')}
                </div>
              )}
            </div>
          </div>
          <div className="cover">
            <div className="cover-content">
              {t('quiz.startQuiz')}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={startQuiz}
            className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            {t('quiz.startQuiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
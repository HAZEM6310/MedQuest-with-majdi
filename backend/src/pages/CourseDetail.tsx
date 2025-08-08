import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Course, Question, Faculty } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, Calendar, Percent, Timer, CheckCircle, 
  XCircle, AlertCircle, ExternalLink 
} from "lucide-react";

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
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  
  const { theme } = useTheme();

  useEffect(() => {
    if (!courseId) return;
    fetchCourseData();
    if (user?.id) {
      fetchRecentAttempts();
    }
  }, [courseId, user]);
  
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

  const fetchRecentAttempts = async () => {
    setAttemptsLoading(true);
    try {
      // Fetch recent attempts for this course by the current user
      const { data, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Transform data to match the required format
      const formattedAttempts = data?.map(attempt => {
        // Calculate correct, incorrect, and partial answers
        const correct = attempt.score || 0;
        const totalAnswered = attempt.questions_answered || 0;
        // We don't have explicit partial score data, so we're assuming there's no partial
        const partial = 0;
        const incorrect = totalAnswered - correct - partial;
        
        return {
          id: attempt.id,
          grade: attempt.final_grade || 0,
          questionsAnswered: totalAnswered,
          totalQuestions: attempt.total_questions || totalAnswered,
          duration: attempt.duration || 0,
          completedAt: attempt.updated_at,
          isCompleted: attempt.is_completed,
          correct,
          incorrect,
          partial
        };
      }) || [];
      
      setRecentAttempts(formattedAttempts);
    } catch (error) {
      console.error('Error fetching recent attempts:', error);
    } finally {
      setAttemptsLoading(false);
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

  // Format duration from seconds to hours, minutes, seconds
  const formatDuration = (durationInSeconds: number) => {
    if (!durationInSeconds) return "-";
    
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    
    return [
      hours > 0 ? `${hours}h` : "",
      minutes > 0 ? `${minutes}min` : "",
      `${seconds}sec`
    ].filter(Boolean).join(" ");
  };

  // Format date to DD/MM/YY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
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
          .container.noselect {
            position: relative;
            width: 260px;
            height: 340px;
            transition: 200ms;
            margin-bottom: 1.5rem;
          }
          
          .container.noselect:active {
            width: 250px;
            height: 330px;
          }
          
          #card {
            position: absolute;
            inset: 0;
            z-index: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            border-radius: 20px;
            transition: 700ms;
            background: linear-gradient(43deg, #0C2230 0%, #1F3A4B 46%, #3C5B6F 100%);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            cursor: pointer;
          }
          
          .subtitle {
            transform: translateY(160px);
            color: #FFFFFF;
            text-align: center;
            width: 100%;
            opacity: 0;
            transition: 300ms ease-in-out;
            font-size: 0.95rem;
            font-weight: 500;
          }
          
          .title {
            opacity: 0;
            transition-duration: 300ms;
            transition-timing-function: ease-in-out;
            transition-delay: 100ms;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            text-align: center;
            margin-bottom: 0.5rem;
          }
          
          .tracker:hover ~ #card .title {
            opacity: 1;
          }
          
          .tracker:hover ~ #card .subtitle {
            opacity: 1;
            transform: translateY(70px);
          }
          
          #prompt {
            bottom: 20px;
            z-index: 20;
            font-size: 1.25rem;
            font-weight: bold;
            transition: 300ms ease-in-out;
            position: absolute;
            color: #FFFFFF;
            text-align: center;
            width: 100%;
          }
          
          .tracker {
            position: absolute;
            z-index: 200;
            width: 100%;
            height: 100%;
          }
          
          .tracker:hover {
            cursor: pointer;
          }
          
          .tracker:hover ~ #card #prompt {
            opacity: 0;
          }
          
          .tracker:hover ~ #card {
            transition: 300ms;
            filter: brightness(1.1);
          }
          
          .container.noselect:hover #card::before {
            transition: 200ms;
            content: '';
            opacity: 80%;
          }
          
          .canvas {
            perspective: 800px;
            inset: 0;
            z-index: 200;
            position: absolute;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
            gap: 0px 0px;
            grid-template-areas: "tr-1 tr-2 tr-3 tr-4 tr-5"
              "tr-6 tr-7 tr-8 tr-9 tr-10"
              "tr-11 tr-12 tr-13 tr-14 tr-15"
              "tr-16 tr-17 tr-18 tr-19 tr-20"
              "tr-21 tr-22 tr-23 tr-24 tr-25";
          }
          
          #card::before {
            content: '';
            background: linear-gradient(43deg, #0C2230 0%, #1F3A4B 46%, #3C5B6F 100%);
            filter: blur(2rem);
            opacity: 30%;
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: -1;
            transition: 200ms;
            border-radius: 20px;
          }
          
          .tr-1 { grid-area: tr-1; }
          .tr-2 { grid-area: tr-2; }
          .tr-3 { grid-area: tr-3; }
          .tr-4 { grid-area: tr-4; }
          .tr-5 { grid-area: tr-5; }
          .tr-6 { grid-area: tr-6; }
          .tr-7 { grid-area: tr-7; }
          .tr-8 { grid-area: tr-8; }
          .tr-9 { grid-area: tr-9; }
          .tr-10 { grid-area: tr-10; }
          .tr-11 { grid-area: tr-11; }
          .tr-12 { grid-area: tr-12; }
          .tr-13 { grid-area: tr-13; }
          .tr-14 { grid-area: tr-14; }
          .tr-15 { grid-area: tr-15; }
          .tr-16 { grid-area: tr-16; }
          .tr-17 { grid-area: tr-17; }
          .tr-18 { grid-area: tr-18; }
          .tr-19 { grid-area: tr-19; }
          .tr-20 { grid-area: tr-20; }
          .tr-21 { grid-area: tr-21; }
          .tr-22 { grid-area: tr-22; }
          .tr-23 { grid-area: tr-23; }
          .tr-24 { grid-area: tr-24; }
          .tr-25 { grid-area: tr-25; }

          .tr-1:hover ~ #card { transform: rotateX(20deg) rotateY(-10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-2:hover ~ #card { transform: rotateX(20deg) rotateY(-5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-3:hover ~ #card { transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-4:hover ~ #card { transform: rotateX(20deg) rotateY(5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-5:hover ~ #card { transform: rotateX(20deg) rotateY(10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-6:hover ~ #card { transform: rotateX(10deg) rotateY(-10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-7:hover ~ #card { transform: rotateX(10deg) rotateY(-5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-8:hover ~ #card { transform: rotateX(10deg) rotateY(0deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-9:hover ~ #card { transform: rotateX(10deg) rotateY(5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-10:hover ~ #card { transform: rotateX(10deg) rotateY(10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-11:hover ~ #card { transform: rotateX(0deg) rotateY(-10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-12:hover ~ #card { transform: rotateX(0deg) rotateY(-5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-13:hover ~ #card { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-14:hover ~ #card { transform: rotateX(0deg) rotateY(5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-15:hover ~ #card { transform: rotateX(0deg) rotateY(10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-16:hover ~ #card { transform: rotateX(-10deg) rotateY(-10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-17:hover ~ #card { transform: rotateX(-10deg) rotateY(-5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-18:hover ~ #card { transform: rotateX(-10deg) rotateY(0deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-19:hover ~ #card { transform: rotateX(-10deg) rotateY(5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-20:hover ~ #card { transform: rotateX(-10deg) rotateY(10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-21:hover ~ #card { transform: rotateX(-20deg) rotateY(-10deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-22:hover ~ #card { transform: rotateX(-20deg) rotateY(-5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-23:hover ~ #card { transform: rotateX(-20deg) rotateY(0deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-24:hover ~ #card { transform: rotateX(-20deg) rotateY(5deg) rotateZ(0deg); transition: 125ms ease-in-out; }
          .tr-25:hover ~ #card { transform: rotateX(-20deg) rotateY(10deg) rotateZ(0deg); transition: 125ms ease-in-out; }

          .noselect {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          .question-count {
            background-color: #648598;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-top: 1rem;
          }
        `}</style>
        
        <div className="container noselect" onClick={startQuiz}>
          <div className="canvas">
            <div className="tracker tr-1"></div>
            <div className="tracker tr-2"></div>
            <div className="tracker tr-3"></div>
            <div className="tracker tr-4"></div>
            <div className="tracker tr-5"></div>
            <div className="tracker tr-6"></div>
            <div className="tracker tr-7"></div>
            <div className="tracker tr-8"></div>
            <div className="tracker tr-9"></div>
            <div className="tracker tr-10"></div>
            <div className="tracker tr-11"></div>
            <div className="tracker tr-12"></div>
            <div className="tracker tr-13"></div>
            <div className="tracker tr-14"></div>
            <div className="tracker tr-15"></div>
            <div className="tracker tr-16"></div>
            <div className="tracker tr-17"></div>
            <div className="tracker tr-18"></div>
            <div className="tracker tr-19"></div>
            <div className="tracker tr-20"></div>
            <div className="tracker tr-21"></div>
            <div className="tracker tr-22"></div>
            <div className="tracker tr-23"></div>
            <div className="tracker tr-24"></div>
            <div className="tracker tr-25"></div>
            <div id="card">
              <p id="prompt">{t('quiz.startQuiz')}</p>
              <div className="title">
                {getLocalizedText(course.title_en, course.title_fr, course.title)}
              </div>
              <div className="question-count">
                {filteredQuestions.length} {t('course.totalQuestions')}
              </div>
              <div className="subtitle">
                {selectedFacultyId !== "all" && t('faculty.filtered')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <button
            onClick={startQuiz}
            className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            {t('quiz.startQuiz')}
          </button>
        </div>
      </div>

      {/* Recent Attempts Section */}
      {user && (
        <div className="w-full max-w-2xl px-4 mt-10">
          <Card>
            <CardHeader>
              <CardTitle>{t('progress.recentAttempts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {attemptsLoading ? (
                <div className="text-center py-4">
                  <p>{t('ui.loading')}...</p>
                </div>
              ) : recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {recentAttempts.map((attempt, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            attempt.isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attempt.isCompleted ? t('quiz.completed') : t('quiz.inProgress')}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(attempt.completedAt)}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/quiz/${attempt.id}/review`}>
                            {t('progress.viewDetails')}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-xs font-medium block">{t('progress.progress')}</span>
                            <span className="text-sm">{attempt.questionsAnswered}/{attempt.totalQuestions}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-xs font-medium block">{t('progress.grade')}</span>
                            <span className="text-sm">{attempt.grade.toFixed(1)}/20</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-xs font-medium block">{t('progress.duration')}</span>
                            <span className="text-sm">{formatDuration(attempt.duration)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <span className="text-xs font-medium block">{t('progress.correct')}</span>
                            <span className="text-sm">{attempt.correct}/{attempt.totalQuestions}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Results progress bar */}
                      <div className="relative pt-1">
                        <div className="flex h-2 overflow-hidden text-xs bg-gray-200 rounded">
                          <div 
                            style={{ width: `${(attempt.correct / attempt.totalQuestions) * 100}%` }} 
                            className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none whitespace-nowrap"
                          ></div>
                          {attempt.partial > 0 && (
                            <div 
                              style={{ width: `${(attempt.partial / attempt.totalQuestions) * 100}%` }} 
                              className="flex flex-col justify-center text-center text-white bg-yellow-500 shadow-none whitespace-nowrap"
                            ></div>
                          )}
                          <div 
                            style={{ width: `${(attempt.incorrect / attempt.totalQuestions) * 100}%` }} 
                            className="flex flex-col justify-center text-center text-white bg-red-500 shadow-none whitespace-nowrap"
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">{t('progress.noAttemptsYet')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
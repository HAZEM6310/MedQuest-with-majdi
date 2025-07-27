import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Course, Question } from "@/types";
import { Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState({ attempted: 0, correct: 0 });

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
        .select('*, options(*)')
        .eq('course_id', courseId);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      if (user) {
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (userProgress) {
          setProgress({
            attempted: userProgress.questions_attempted,
            correct: userProgress.questions_correct,
          });
        }
      }
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
          <Button>{t("ui.back")}</Button>
        </Link>
      </div>
    );
  }

  const progressPercentage =
    course.question_count > 0
      ? Math.round((progress.attempted / course.question_count) * 100)
      : 0;

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link to="/courses" className="text-secondary hover:underline font-medium">
          {t("nav.courses")}
        </Link>
        <span>/</span>
        <span className="truncate text-foreground font-semibold">
          {getLocalizedText(course.title_en, course.title_fr, course.title)}
        </span>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
                {getLocalizedText(course.title_en, course.title_fr, course.title)}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                {getLocalizedText(course.description_en, course.description_fr, course.description)}
              </p>
              <div className="text-sm text-secondary mb-2">{course.category}</div>
            </div>
            <div className="flex-shrink-0 w-full md:w-56">
              <img
                src={course.image || "/placeholder.svg"}
                alt={getLocalizedText(course.title_en, course.title_fr, course.title)}
                className="w-full h-36 md:h-40 object-cover rounded-xl border"
              />
            </div>
          </div>

          <div className="mb-6">
            <Link to={`/courses/${courseId}/quiz`} className="w-full block">
              <Button className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 font-semibold shadow-md">
                {t("quiz.startQuiz")}
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("course.sampleQuestions")}</CardTitle>
              <CardDescription>{t("course.previewQuestions")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.slice(0, 2).map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <p className="font-medium">
                      {index + 1}. {getLocalizedText(question.text_en, question.text_fr, question.text)}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {question.options?.slice(0, 2).map((option) => (
                        <li key={option.id} className="text-muted-foreground text-sm">
                          • {getLocalizedText(option.text_en, option.text_fr, option.text)}{" "}
                          {option.is_correct ? `(${t("course.correct")})` : ""}
                        </li>
                      ))}
                      <li className="text-muted-foreground text-sm italic">
                        {t("course.moreOptions")}
                      </li>
                    </ul>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-muted-foreground">{t("course.noSampleQuestions")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("course.yourProgress")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t("course.completion")}</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div className="pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("course.attempted")}</span>
                  <span className="font-medium">
                    {progress.attempted} / {course.question_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("course.correct")}</span>
                  <span className="font-medium">
                    {progress.correct} / {progress.attempted}
                  </span>
                </div>
                {progress.attempted > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("course.accuracy")}</span>
                    <span className="font-medium">
                      {Math.round((progress.correct / progress.attempted) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("course.info")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("course.category")}</span>
                <span className="font-medium">{course.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("course.totalQuestions")}</span>
                <span className="font-medium">{course.question_count}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("course.needHelp")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("course.helpText")}
              </p>
              <Button variant="outline" className="w-full mt-2">
                <Book className="mr-2 h-4 w-4" />
                {t("course.viewResources")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

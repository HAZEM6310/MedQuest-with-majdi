import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, BookOpen, CheckCircle, Clock,
  Calendar, Percent, Timer, BarChart2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface ProgressData {
  averageAccuracy: number;
  questionsAttempted: number;
  correctAnswers: number;
  completedQuizzes: number;
  recentActivity: {
    id: string;
    courseName: string;
    grade: number;
    completedAt: string;
    questionsAnswered: number;
    totalQuestions: number;
    duration: number; // in seconds
    correct: number;
    incorrect: number;
    partial: number;
  }[];
  performanceByCourse: {
    courseName: string;
    accuracy: number;
  }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
const CHART_COLORS = {
  correct: '#4ade80',
  incorrect: '#f87171',
  partial: '#facc15'
};

export default function ProgressPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchProgressData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: quizProgress, error } = await supabase
        .from('quiz_progress')
        .select(`
          *,
          courses (title, title_en, title_fr)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching quiz progress:", error);
        throw error;
      }

      if (!quizProgress || quizProgress.length === 0) {
        setProgressData({
          averageAccuracy: 0,
          questionsAttempted: 0,
          correctAnswers: 0,
          completedQuizzes: 0,
          recentActivity: [],
          performanceByCourse: [],
        });
        setLoading(false);
        return;
      }

      // Filter for completed quizzes for some stats
      const completedQuizzes = quizProgress.filter(quiz => quiz.is_completed);
      
      // Calculate statistics from quiz progress data
      const totalQuestions = quizProgress.reduce((sum, quiz) => sum + (quiz.questions_answered || 0), 0);
      const totalCorrect = quizProgress.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
      const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      // Prepare recent activity data
      const recentActivity = quizProgress
        .map((quiz) => {
          // Calculate correct, incorrect, and partial answers
          const correct = quiz.score || 0;
          const totalAnswered = quiz.questions_answered || 0;
          // We don't have explicit partial score data, so we're assuming there's no partial
          const partial = 0;
          const incorrect = totalAnswered - correct - partial;
          
          return {
            id: quiz.id,
            courseName:
              quiz.courses?.[`title_${language}`] ??
              quiz.courses?.title ??
              "Unknown Course",
            grade: quiz.final_grade || 0,
            completedAt: quiz.updated_at,
            questionsAnswered: totalAnswered,
            totalQuestions: quiz.total_questions || totalAnswered,
            duration: quiz.duration || 0,
            correct,
            incorrect,
            partial
          };
        });

      // Prepare performance by course data
      const coursePerformance = new Map();
      quizProgress.forEach(quiz => {
        const courseName = quiz.courses?.[`title_${language}`] ?? quiz.courses?.title ?? "Unknown Course";
        if (!coursePerformance.has(courseName)) {
          coursePerformance.set(courseName, { 
            totalQuestions: 0, 
            correctAnswers: 0 
          });
        }
        const current = coursePerformance.get(courseName);
        current.totalQuestions += quiz.questions_answered || 0;
        current.correctAnswers += quiz.score || 0;
      });
      
      const performanceByCourse = Array.from(coursePerformance.entries()).map(([courseName, data]) => ({
        courseName,
        accuracy: data.totalQuestions > 0 
          ? (data.correctAnswers / data.totalQuestions) * 100 
          : 0
      }));

      setProgressData({
        averageAccuracy,
        questionsAttempted: totalQuestions,
        correctAnswers: Math.round(totalCorrect), // Ensure whole number
        completedQuizzes: completedQuizzes.length,
        recentActivity,
        performanceByCourse,
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
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

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">{t('progress.loginRequired')}</CardTitle>
              <CardDescription>{t('progress.loginRequiredDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90">
                <Link to="/auth">{t('auth.login')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>{t('ui.loading')}</p>
      </div>
    );
  }

  if (!progressData || progressData.completedQuizzes === 0) {
    return (
      <div className="container py-8 text-center">
        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('progress.noProgress')}</h2>
        <p className="text-muted-foreground">{t('progress.noProgressDesc')}</p>
      </div>
    );
  }

  const accuracyDistribution = [
    { name: t('progress.correct'), value: progressData.correctAnswers, color: CHART_COLORS.correct },
    { name: t('progress.incorrect'), value: progressData.questionsAttempted - progressData.correctAnswers, color: CHART_COLORS.incorrect },
  ];

  // Filtered activity for search
  const filteredActivity = progressData.recentActivity.filter((activity) =>
    activity.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('progress.title')}</h1>
        <p className="text-muted-foreground">{t('progress.subtitle')}</p>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t('progress.overview')}</TabsTrigger>
          <TabsTrigger value="charts">{t('progress.charts')}</TabsTrigger>
          <TabsTrigger value="activity">{t('progress.activity')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<TrendingUp />} title={t('progress.averageAccuracy')} value={`${progressData.averageAccuracy.toFixed(1)}%`}>
              <ProgressBar value={progressData.averageAccuracy} className="mt-2" />
            </StatCard>
            <StatCard icon={<BookOpen />} title={t('progress.questionsAttempted')} value={progressData.questionsAttempted} />
            <StatCard icon={<CheckCircle />} title={t('progress.correctAnswers')} value={progressData.correctAnswers} />
            <StatCard icon={<Clock />} title={t('progress.completedQuizzes')} value={progressData.completedQuizzes} />
          </div>
        </TabsContent>
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('progress.performanceChart')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData.performanceByCourse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('progress.accuracyDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accuracyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {accuracyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <Input
            placeholder={t('progress.searchByCourse')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm mb-4"
          />
          <Card>
            <CardHeader>
              <CardTitle>{t('progress.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((activity, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-muted/50">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                          <div>
                            <h3 className="font-medium">{activity.courseName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {t('progress.completedOn')} {new Date(activity.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-sm font-semibold px-2 py-1 rounded-full ${
                                activity.grade >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {activity.grade} / 20
                            </span>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/quiz/${activity.id}/review`}>{t('progress.viewDetails')}</Link>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('progress.progress')}:</span>
                            <span className="text-sm">{activity.questionsAnswered}/{activity.totalQuestions}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('progress.grade')}:</span>
                            <span className="text-sm">{activity.grade.toFixed(1)}/20</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('progress.duration')}:</span>
                            <span className="text-sm">{formatDuration(activity.duration)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('progress.date')}:</span>
                            <span className="text-sm">{formatDate(activity.completedAt)}</span>
                          </div>
                        </div>
                        
                        {/* Results chart */}
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 mr-1">
                                {t('progress.correct')}: {activity.correct}
                              </span>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 mr-1">
                                {t('progress.incorrect')}: {activity.incorrect}
                              </span>
                              {activity.partial > 0 && (
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                                  {t('progress.partial')}: {activity.partial}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex h-2 overflow-hidden text-xs bg-gray-200 rounded">
                            <div 
                              style={{ width: `${(activity.correct / activity.totalQuestions) * 100}%` }} 
                              className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none whitespace-nowrap"
                            ></div>
                            {activity.partial > 0 && (
                              <div 
                                style={{ width: `${(activity.partial / activity.totalQuestions) * 100}%` }} 
                                className="flex flex-col justify-center text-center text-white bg-yellow-500 shadow-none whitespace-nowrap"
                              ></div>
                            )}
                            <div 
                              style={{ width: `${(activity.incorrect / activity.totalQuestions) * 100}%` }} 
                              className="flex flex-col justify-center text-center text-white bg-red-500 shadow-none whitespace-nowrap"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{t('progress.noActivityFound')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, title, value, children }: {
  icon: JSX.Element;
  title: string;
  value: string | number;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {children}
      </CardContent>
    </Card>
  );
}
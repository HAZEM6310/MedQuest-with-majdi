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
  }[];
  performanceByCourse: {
    courseName: string;
    accuracy: number;
  }[];
}

const COLORS = ['#8884d8', '#82ca9d'];

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
    try {
      const { data: quizProgress, error } = await supabase
        .from('quiz_progress')
        .select(`
          *,
          courses (title, title_en, title_fr)
        `)
        .eq('user_id', user?.id)
        .eq('is_completed', true);

      if (error) throw error;

      if (!quizProgress || quizProgress.length === 0) {
        setProgressData({
          averageAccuracy: 0,
          questionsAttempted: 0,
          correctAnswers: 0,
          completedQuizzes: 0,
          recentActivity: [],
          performanceByCourse: [],
        });
        return;
      }

      const totalQuestions = quizProgress.reduce((sum, quiz) => sum + (quiz.questions_answered || 0), 0);
      const totalCorrect = quizProgress.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
      const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      const recentActivity = quizProgress
        .map((quiz) => ({
          id: quiz.id,
          courseName:
            quiz.courses?.[`title_${language}`] ??
            quiz.courses?.title ??
            "Unknown Course",
          grade: quiz.final_grade || 0,
          completedAt: quiz.updated_at,
        }))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10);

      const performanceByCourse = quizProgress.map((quiz) => ({
        courseName:
          quiz.courses?.[`title_${language}`] ??
          quiz.courses?.title ??
          "Unknown Course",
        accuracy:
          quiz.questions_answered > 0
            ? (quiz.score / quiz.questions_answered) * 100
            : 0,
      }));

      setProgressData({
        averageAccuracy,
        questionsAttempted: totalQuestions,
        correctAnswers: totalCorrect,
        completedQuizzes: quizProgress.length,
        recentActivity,
        performanceByCourse,
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
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
    { name: t('progress.correct'), value: progressData.correctAnswers },
    { name: t('progress.incorrect'), value: progressData.questionsAttempted - progressData.correctAnswers },
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            placeholder="Search by course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm mb-4"
          />
          <Card>
            <CardHeader>
              <CardTitle>{t('progress.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivity.map((activity, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg gap-2">
                    <div>
                      <p className="font-medium">{activity.courseName}</p>
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
                      <Button asChild size="sm" variant="link">
                        <Link to={`/quiz/${activity.id}/review`}>{t('progress.viewDetails') || 'View Details'}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredActivity.length === 0 && (
                  <p className="text-muted-foreground">No activity found.</p>
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Year } from "@/types";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import IncompleteQuizzes from "@/components/IncompleteQuizzes";

export default function Index() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from('years')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setYears(data || []);
    } catch (error) {
      console.error('Error fetching years:', error);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'aesthetic' ? 'aesthetic-bg' : 'bg-background'}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-600 mb-6">
            Med<span className="text-primary">Quest</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Incomplete Quizzes */}
        {user && <IncompleteQuizzes />}

        {/* Years Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {years.map((year) => (
            <Link to={`/year/${year.id}/subjects`} key={year.id}>
              <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${theme === 'aesthetic' ? 'aesthetic-card' : 'bg-white/70 backdrop-blur-sm'} border-0 shadow-lg`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-600 group-hover:text-primary transition-colors">
                    {getLocalizedText(year.name_en, year.name_fr, year.name)}
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {getLocalizedText(year.description_en, year.description_fr, year.description)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="group-hover:bg-primary group-hover:text-white transition-colors">
                    {t('ui.explore')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {years.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-500">{t('course.noContent')}</h3>
            <p className="text-gray-400">{t('course.checkLater')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
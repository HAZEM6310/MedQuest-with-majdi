import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Year, Subject } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

const themeConfig = {
  purple: { primary: '250 45% 60%' },
  blue: { primary: '200 45% 70%' },
  caramel: { primary: '30 45% 50%' },
  pinky: { primary: '340 45% 70%' },
  lollipop: { primary: '174 50% 50%' },
  aesthetic: {},
  noir: { primary: '196 34% 24%' },
};

export default function YearSubjects() {
  const { yearId } = useParams<{ yearId: string }>();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [year, setYear] = useState<Year | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (yearId) {
      fetchYearAndSubjects();
    }
  }, [yearId]);

  const fetchYearAndSubjects = async () => {
    try {
      // Fetch year
      const { data: yearData, error: yearError } = await supabase
        .from('years')
        .select('*')
        .eq('id', yearId)
        .single();

      if (yearError) throw yearError;
      setYear(yearData);

      // Fetch subjects for this year
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('year_id', yearId)
        .order('order_index');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);
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
        <p>{t('ui.loading')}</p>
      </div>
    );
  }

  if (!year) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-xl font-bold mb-4">{t('course.notFound')}</h2>
        <Link to="/">
          <Button>{t('course.backHome')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 px-2 md:px-4">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('ui.back')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{getLocalizedText(year.name_en, year.name_fr, year.name)}</h1>
        <p className="text-muted-foreground">{getLocalizedText(year.description_en, year.description_fr, year.description)}</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('course.noContent')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link to={`/subjects/${subject.id}`} key={subject.id} style={{ textDecoration: 'none' }}>
              <div
                className={`custom-subject-card card ${theme === 'aesthetic' ? 'aesthetic-card' : ''}`}
                style={{
                  ...(theme !== 'aesthetic' && themeConfig[theme] && themeConfig[theme].primary
                    ? { background: `hsl(${themeConfig[theme].primary})` }
                    : {}),
                  color: '#4B5563'
                }}
              >
                <div className="first-content w-full h-full flex items-center justify-center font-bold text-center">
                  <span className="w-full text-center">{getLocalizedText(subject.name_en, subject.name_fr, subject.name)}</span>
                </div>
                <div className="second-content w-full h-full flex items-center justify-center font-bold text-center">
                  <span className="w-full text-center">Start</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

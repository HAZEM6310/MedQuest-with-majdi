import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Year, Subject } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function YearSubjects() {
  const { yearId } = useParams<{ yearId: string }>();
  const { t, language } = useLanguage();
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
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">{getLocalizedText(subject.name_en, subject.name_fr, subject.name)}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">{getLocalizedText(subject.description_en, subject.description_fr, subject.description)}</p>
                <Link to={`/subjects/${subject.id}`}>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    {t('ui.explore')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

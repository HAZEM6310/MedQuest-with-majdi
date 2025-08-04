import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  // Function to get a color based on index
  const getCardColor = (index: number) => {
    const colors = ["#213341", "#4A5C6A", "#9AA8AB"];
    return colors[index % colors.length];
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

        {/* Years Cards with new styling */}
        <style jsx global>{`
          .cards {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 25px;
            margin-top: 30px;
            perspective: 1000px;
          }

          .cards .card {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            height: 180px;
            width: 280px;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            transition: all 400ms ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          }

          .cards .card .tip {
            font-size: 1.3em;
            font-weight: 700;
            margin-bottom: 0.75rem;
          }

          .cards .card .second-text {
            font-size: 0.85em;
            opacity: 0.8;
            line-height: 1.4;
            max-width: 250px;
            padding: 0 1rem;
          }

          .cards .card .explore-btn {
            position: absolute;
            bottom: -40px;
            opacity: 0;
            background-color: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 30px;
            font-weight: 600;
            transition: all 300ms ease;
            display: flex;
            align-items: center;
          }

          .cards .card:hover {
            transform: scale(1.1);
            z-index: 10;
          }

          .cards .card:hover .explore-btn {
            bottom: 20px;
            opacity: 1;
          }

          .cards:hover > .card:not(:hover) {
            filter: blur(5px) brightness(0.7);
            transform: scale(0.9);
          }
        `}</style>

        <div className="cards">
          {years.map((year, index) => (
            <Link 
              to={`/year/${year.id}/subjects`} 
              key={year.id} 
              className="card"
              style={{ backgroundColor: getCardColor(index) }}
            >
              <p className="tip">
                {getLocalizedText(year.name_en, year.name_fr, year.name)}
              </p>
              <p className="second-text">
                {getLocalizedText(year.description_en, year.description_fr, year.description)}
              </p>
              <div className="explore-btn">
                {t('ui.explore')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { BookOpen, Search, Clock, Users, Star } from "lucide-react";

interface Course {
  id: string;
  title: string;
  title_en?: string;
  title_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  question_count: number;
  category?: string;
  is_free: boolean;
  image?: string;
}

export default function Courses() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const filteredCourses = courses.filter(course => {
    const title = getLocalizedText(course.title_en, course.title_fr, course.title);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'aesthetic' ? 'aesthetic-bg' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-600 mb-4">
            {t('nav.courses')}
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            {t('course.discover')}
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('ui.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                {t('ui.all')}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`${theme === 'aesthetic' ? 'aesthetic-card' : 'bg-white/70 backdrop-blur-sm'} border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('course.totalCourses')}</p>
                  <p className="text-2xl font-bold text-gray-600">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'aesthetic' ? 'aesthetic-card' : 'bg-white/70 backdrop-blur-sm'} border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('course.freeCourses')}</p>
                  <p className="text-2xl font-bold text-gray-600">{courses.filter(c => c.is_free).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'aesthetic' ? 'aesthetic-card' : 'bg-white/70 backdrop-blur-sm'} border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('course.questions')}</p>
                  <p className="text-2xl font-bold text-gray-600">{courses.reduce((sum, course) => sum + course.question_count, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link to={`/courses/${course.id}/quiz`} key={course.id}>
              <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${theme === 'aesthetic' ? 'aesthetic-card' : 'bg-white/70 backdrop-blur-sm'} border-0 shadow-lg h-full`}>
                {course.image && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={course.image} 
                      alt={getLocalizedText(course.title_en, course.title_fr, course.title)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {course.is_free && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        {t('course.freeCourses')}
                      </Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-gray-600 group-hover:text-primary transition-colors line-clamp-2">
                      {getLocalizedText(course.title_en, course.title_fr, course.title)}
                    </CardTitle>
                    {course.category && (
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {course.category}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-500 line-clamp-3">
                    {getLocalizedText(course.description_en, course.description_fr, course.description)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.question_count} {t('course.questions')}
                    </div>
                    <Button size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                      {t('course.start')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-500">
              {searchTerm ? t('course.noCoursesFound') : t('course.noContent')}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? t('course.tryOtherKeywords') : t('course.checkLater')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

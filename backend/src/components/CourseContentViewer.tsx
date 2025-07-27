import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

interface CourseSection {
  id: string;
  title_en: string;
  title_fr: string;
  description_en?: string;
  description_fr?: string;
  content_en?: string;
  content_fr?: string;
  order_index: number;
}

interface CourseContentViewerProps {
  courseId: string;
  isAdmin?: boolean;
}

export default function CourseContentViewer({ courseId, isAdmin = false }: CourseContentViewerProps) {
  const { language } = useLanguage();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement du contenu...</div>;
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        </div>
      )}

      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Aucune section créée. Commencez par ajouter du contenu."
                : "Contenu en cours de développement."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {language === 'fr' ? section.title_fr : section.title_en}
                </CardTitle>
                {isAdmin && (
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {section.description_en || section.description_fr ? (
                  <p className="text-muted-foreground mb-4">
                    {language === 'fr' ? section.description_fr : section.description_en}
                  </p>
                ) : null}
                {section.content_en || section.content_fr ? (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: language === 'fr' ? section.content_fr || '' : section.content_en || ''
                    }} />
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Contenu en cours de rédaction...</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

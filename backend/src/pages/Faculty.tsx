import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Faculty, Subject, Course } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import "@/styles/card.css";

interface FacultySubject extends Subject {
  courses: Course[];
}

export default function FacultyPage() {
  const { t, language } = useLanguage();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [facultySubjects, setFacultySubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      fetchFacultySubjects(selectedFacultyId);
    } else {
      setFacultySubjects([]);
    }
  }, [selectedFacultyId]);

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultySubjects = async (facultyId: string) => {
    setLoadingSubjects(true);
    try {
      // Step 1: Get all questions for this faculty to find related courses
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('course_id')
        .eq('faculty_id', facultyId);

      if (questionsError) throw questionsError;

      // Extract unique course IDs
      const uniqueCourseIds = [...new Set(questions?.map(q => q.course_id) || [])];
      
      if (uniqueCourseIds.length === 0) {
        setFacultySubjects([]);
        return;
      }

      // Step 2: Get all courses for these IDs
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*, subject_id')
        .in('id', uniqueCourseIds);

      if (coursesError) throw coursesError;

      // Extract unique subject IDs
      const uniqueSubjectIds = [...new Set(courses?.map(c => c.subject_id) || [])];
      
      if (uniqueSubjectIds.length === 0) {
        setFacultySubjects([]);
        return;
      }

      // Step 3: Get all subjects for these IDs
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', uniqueSubjectIds)
        .order('order_index');

      if (subjectsError) throw subjectsError;

      // Step 4: Organize courses under their subjects
      const subjectsWithCourses: FacultySubject[] = (subjects || []).map(subject => {
        const subjectCourses = courses?.filter(course => course.subject_id === subject.id) || [];
        return {
          ...subject,
          courses: subjectCourses
        };
      });

      setFacultySubjects(subjectsWithCourses);
    } catch (error) {
      console.error('Error fetching faculty subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const getLocalizedText = (enText?: string, frText?: string, fallback?: string) =>
    language === "en" ? enText ?? fallback ?? "" : frText ?? fallback ?? "";

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('faculty.browse')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t('faculty.browse')}</h1>
      
      {/* Faculty Selection */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{t('faculty.select')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {faculties.map((faculty) => (
            <div 
              key={faculty.id}
              className={`card ${selectedFacultyId === faculty.id ? "selected" : ""}`}
              onClick={() => setSelectedFacultyId(faculty.id)}
            >
              <div className="card__shine"></div>
              <div className="card__glow"></div>
              <div className="card__content">
                {selectedFacultyId === faculty.id && (
                  <div className="card__badge">{t('faculty.selected')}</div>
                )}
                <div style={{ "--bg-color": "#8b5cf6" } as React.CSSProperties} className="card__image"></div>
                <div className="card__text">
                  <p className="card__title">
                    {getLocalizedText(faculty.name_en, faculty.name_fr, faculty.name)}
                  </p>
                  {faculty.university_name && (
                    <p className="card__description">
                      {getLocalizedText(
                        faculty.university_name_en, 
                        faculty.university_name_fr, 
                        faculty.university_name
                      )}
                    </p>
                  )}
                </div>
                <div className="card__footer">
                  <div className="card__price">{t('faculty.explore')}</div>
                  <div className="card__button">
                    <svg height="16" width="16" viewBox="0 0 24 24">
                      <path
                        strokeWidth="2"
                        stroke="currentColor"
                        d="M4 12H20M12 4V20"
                        fill="none"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtered Subjects and Courses */}
      {selectedFacultyId && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t('faculty.filteredSubjects')}
            </h2>
          </div>
          
          {loadingSubjects ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : facultySubjects.length > 0 ? (
            <div className="space-y-8">
              {facultySubjects.map((subject) => (
                <div key={subject.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">
                    {getLocalizedText(subject.name_en, subject.name_fr, subject.name)}
                  </h3>
                  {subject.courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {subject.courses.map((course) => (
                        <Link 
                          key={course.id} 
                          to={`/courses/${course.id}?faculty=${selectedFacultyId}`}
                          className="block p-3 border rounded hover:bg-accent/30 transition-colors"
                        >
                          <h4 className="font-medium">
                            {getLocalizedText(course.title_en, course.title_fr, course.title)}
                          </h4>
                          {course.question_count && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.question_count} {t('course.questions')}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t('course.noCoursesFound')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t('faculty.noSubjectsFound')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Course, Question, QuizSettings as QuizSettingsType, QuizProgress } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import QuizSettings from "@/components/QuizSettings";
import QuizResultsPanel from "@/components/QuizResultsPanel";
import QuizReview from "@/components/QuizReview";
import QcmBody from "@/components/mcq/QcmBody";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import QuizSidebar from "@/components/quiz/QuizSidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLoading } from "@/contexts/loading-context";

export default function Quiz() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const facultyId = searchParams.get('faculty');
  
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [partiallyCorrectQuestions, setPartiallyCorrectQuestions] = useState<Set<number>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string[]}>({});
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctQuestions, setCorrectQuestions] = useState<Set<number>>(new Set());
  const [wrongQuestionIndexes, setWrongQuestionIndexes] = useState<Set<number>>(new Set());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);

  // Define currentQuestion based on currentQuestionIndex
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionAnswered = answeredQuestions.has(currentQuestionIndex);

  useEffect(() => {
    if (!courseId) return;
    fetchCourseAndQuestions();
    checkExistingProgress();
  }, [courseId]);

  // Timer effect
  useEffect(() => {
    if (quizSettings && !isPaused && !quizCompleted) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizSettings, isPaused, quizCompleted]);

  // Auto-save progress every 10 seconds during quiz
  useEffect(() => {
    if (quizSettings && !quizCompleted && questionsAnswered > 0) {
      const interval = setInterval(() => {
        saveProgress();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [quizSettings, quizCompleted, questionsAnswered, userAnswers, currentQuestionIndex, answeredQuestions, correctQuestions, wrongQuestionIndexes, partiallyCorrectQuestions]);

  const checkExistingProgress = async () => {
    if (!user || !courseId) return;
    
    try {
      const { data: savedProgress, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (savedProgress && savedProgress.questions_answered > 0) {
        setHasExistingProgress(true);
        setShowContinueDialog(true);
      }
    } catch (error) {
      console.log('No existing progress found:', error);
    }
  };

  const loadSavedProgress = async () => {
    if (!user || !courseId) return;
    
    startLoading(t('quiz.loading'));
    
    try {
      const { data: savedProgress, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (savedProgress) {
        setCurrentQuestionIndex(savedProgress.current_question || 0);
        const answers = savedProgress.user_answers;
        if (answers && typeof answers === 'object') {
          setUserAnswers(answers as {[key: string]: string[]});
          
          // Restore answered questions tracking
          const answeredSet = new Set<number>();
          const correctSet = new Set<number>();
          const wrongSet = new Set<number>();
          const partialSet = new Set<number>();
          
          // If we have partially_correct_questions in the saved data, restore it
          if (savedProgress.partially_correct_questions && Array.isArray(savedProgress.partially_correct_questions)) {
            savedProgress.partially_correct_questions.forEach((index: number) => {
              partialSet.add(index);
            });
          }
          
          Object.keys(answers).forEach((questionId) => {
            const questionIndex = questions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
              answeredSet.add(questionIndex);
              
              // Check if this question was answered correctly
              const question = questions[questionIndex];
              const userQuestionAnswers = (answers as {[key: string]: string[]})[questionId] || [];
              const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
              
              // Check if answer is fully correct
              const isQuestionCorrect = userQuestionAnswers.length === correctOptions.length &&
                                     userQuestionAnswers.every(answerId => correctOptions.some(opt => opt.id === answerId));
              
              // Check if answer is partially correct
              const isPartiallyCorrect = userQuestionAnswers.length < correctOptions.length && 
                                       userQuestionAnswers.every(answerId => correctOptions.some(opt => opt.id === answerId)) &&
                                       userQuestionAnswers.length > 0;
              
              if (isQuestionCorrect) {
                correctSet.add(questionIndex);
              } else if (isPartiallyCorrect) {
                partialSet.add(questionIndex);
              } else {
                wrongSet.add(questionIndex);
              }
            }
          });
          
          setAnsweredQuestions(answeredSet);
          setCorrectQuestions(correctSet);
          setWrongQuestionIndexes(wrongSet);
          setPartiallyCorrectQuestions(partialSet);
        }
        setScore(savedProgress.score || 0);
        setQuestionsAnswered(savedProgress.questions_answered || 0);
        const wrongAns = savedProgress.wrong_answers;
        if (Array.isArray(wrongAns)) {
          setWrongAnswers(wrongAns);
        }
        
        toast.success(t('quiz.continue'));
      }
    } catch (error) {
      console.log('No saved progress found:', error);
    } finally {
      stopLoading();
    }
  };

  const clearSavedProgress = async () => {
    if (!user || !courseId) return;

    try {
      const { error } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  const saveProgress = async () => {
    if (!user || !courseId) return;
  
    try {
      const progressData = {
        user_id: user.id,
        course_id: courseId,
        current_question: currentQuestionIndex,
        user_answers: userAnswers,
        score: Math.round(score), // Ensure score is an integer
        questions_answered: questionsAnswered,
        wrong_answers: wrongAnswers,
        partially_correct_questions: Array.from(partiallyCorrectQuestions),
        is_completed: false,
        updated_at: new Date().toISOString()
      };
  
      const { error } = await supabase
        .from('quiz_progress')
        .upsert(progressData, {
          onConflict: 'user_id,course_id'
        });
  
      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const fetchCourseAndQuestions = async () => {
    startLoading(t('quiz.loading'));
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Build query with optional faculty filter
      let questionsQuery = supabase
        .from('questions')
        .select(`
          *,
          options (*)
        `)
        .eq('course_id', courseId);
        
      // Apply faculty filter if selected
      if (facultyId && facultyId !== 'all') {
        questionsQuery = questionsQuery.eq('faculty_id', facultyId);
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) throw questionsError;
      
      const shuffledQuestions = (questionsData || []).sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('quiz.loading'));
      navigate(-1);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const handleContinueQuiz = () => {
    setShowContinueDialog(false);
    loadSavedProgress();
  };

  const handleStartOverQuiz = () => {
    setShowContinueDialog(false);
    clearSavedProgress();
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestionIndexes(new Set());
    setPartiallyCorrectQuestions(new Set());
  };

  const handleQuestionSelect = (questionIndex: number) => {
    if (quizCompleted && !quizSettings?.showAnswersImmediately) {
      setCurrentQuestionIndex(questionIndex);
      const selectedAnswers = userAnswers[questions[questionIndex].id] || [];
      setSelectedOptionId(selectedAnswers[0] || null);
      return;
    }
    
    if (showResult && !isRetryMode) return;
    
    setCurrentQuestionIndex(questionIndex);
    const selectedAnswers = userAnswers[questions[questionIndex].id] || [];
    setSelectedOptionId(selectedAnswers[0] || null);
  };

  const calculateGrade = () => {
    if (questions.length === 0) return 0;

    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(question => {
      const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
      const userQuestionAnswers = userAnswers[question.id] || [];
      
      maxScore += correctOptions.length;
      
      // Calculate partial credit
      let questionScore = 0;
      let wrongAnswers = 0;
      
      userQuestionAnswers.forEach(answerId => {
        if (correctOptions.some(opt => opt.id === answerId)) {
          questionScore += 1;
        } else {
          wrongAnswers += 1;
        }
      });
      
      // Subtract points for wrong answers
      questionScore = Math.max(0, questionScore - wrongAnswers);
      totalScore += questionScore;
    });

    if (maxScore === 0) return 0;
    return Math.round((totalScore / maxScore) * 20);
  };

  const handleQuizStart = (settings: QuizSettingsType) => {
    setQuizSettings(settings);
    setTimer(0);
    setIsPaused(false);
  };

  const handleOptionSelect = (optionId: string) => {
    // Allow selection in retry mode, regardless of showResult state
    if (showResult && !isRetryMode) return;
  
    const currentAnswers = userAnswers[currentQuestion.id] || [];
    let newAnswers;
    
    if (currentAnswers.includes(optionId)) {
      newAnswers = currentAnswers.filter(id => id !== optionId);
    } else {
      newAnswers = [...currentAnswers, optionId];
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newAnswers
    }));
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || !quizSettings) return;
    
    const selectedAnswers = userAnswers[currentQuestion.id] || [];
    if (selectedAnswers.length === 0) return;
    
    const correctOptions = currentQuestion.options?.filter(opt => opt.is_correct) || [];
    
    // Check if answer is fully correct (all correct options selected, no incorrect ones)
    const isFullyCorrect = selectedAnswers.length === correctOptions.length &&
    selectedAnswers.every(answerId => correctOptions.some(opt => opt.id === answerId));
    
    // Check if answer is partially correct (some correct options selected, no incorrect ones)
    const isPartiallyCorrect = selectedAnswers.length < correctOptions.length && 
    selectedAnswers.every(answerId => correctOptions.some(opt => opt.id === answerId)) &&
    selectedAnswers.length > 0;
                             
    setIsCorrect(isFullyCorrect);
    setQuestionsAnswered(prev => prev + 1);
    
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
    
    if (isFullyCorrect) {
      setScore(prev => prev + 1);
      setCorrectQuestions(prev => new Set(prev).add(currentQuestionIndex));
    } else if (isPartiallyCorrect) {
      // Handle partially correct answers
      setPartiallyCorrectQuestions(prev => new Set(prev).add(currentQuestionIndex));
      // Give partial credit to the score
      setScore(prev => Math.round(prev + (selectedAnswers.length / correctOptions.length) * 0.5));
    } else {
      setWrongAnswers(prev => [...prev, currentQuestion.id]);
      setWrongQuestionIndexes(prev => new Set(prev).add(currentQuestionIndex));
    }

    // In retry mode, never show results immediately - move to next question
    if (isRetryMode) {
      setTimeout(() => {
        handleNextQuestion();
      }, 500);
    } else if (quizSettings.showAnswersImmediately) {
      setShowResult(true);
    } else {
      setTimeout(() => {
        handleNextQuestion();
      }, 500);
    }

    saveProgress();
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      const nextAnswers = userAnswers[nextQuestion.id] || [];
      setSelectedOptionId(nextAnswers[0] || null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const finalGrade = calculateGrade();
    setQuizCompleted(true);
    setIsRetryMode(false); // Turn off retry mode when finishing
    
    if (user && courseId) {
      try {
        await supabase
          .from('quiz_progress')
          .upsert({
            user_id: user.id,
            course_id: courseId,
            current_question: questions.length,
            user_answers: userAnswers,
            score: Math.round(score), // Ensure score is an integer
            questions_answered: questionsAnswered,
            wrong_answers: wrongAnswers,
            partially_correct_questions: Array.from(partiallyCorrectQuestions),
            is_completed: true,
            final_grade: finalGrade,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id'
          });
      } catch (error) {
        console.error('Error saving final progress:', error);
      }
    }

    // Always show results panel
    setShowResultsPanel(true);
  };

  const handleViewQuestions = () => {
    setShowResultsPanel(false);
    setShowReview(true);
  };

  const handleStartOver = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestionIndexes(new Set());
    setPartiallyCorrectQuestions(new Set());
    setBookmarkedQuestions(new Set());
    setQuizCompleted(false);
    setShowResultsPanel(false);
    setShowReview(false);
    setQuizSettings(null);
    setTimer(0);
    setIsPaused(false);
    setIsRetryMode(false); // Reset retry mode
    clearSavedProgress();
  };

  const handleRetryWrong = () => {
    // Get all question IDs that were not fully correct
    const incorrectQuestionIds = new Set([
      ...wrongAnswers, // Completely wrong answers
      ...Array.from(partiallyCorrectQuestions).map(index => questions[index]?.id).filter(Boolean) // Partially correct answers
    ]);
    
    // Filter the questions to only include incorrect ones
    const incorrectQuestionsOnly = questions.filter(q => incorrectQuestionIds.has(q.id));
    
    if (incorrectQuestionsOnly.length === 0) {
      toast.info(t('quiz.noQuestionsToRetry'));
      return;
    }
    
    // Shuffle the incorrect questions
    const shuffledIncorrectQuestions = [...incorrectQuestionsOnly].sort(() => Math.random() - 0.5);
    
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});  // Clear all previous answers
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestionIndexes(new Set());
    setPartiallyCorrectQuestions(new Set());
    setBookmarkedQuestions(new Set());
    setSelectedOptionId(null);
    setShowResult(false);
    setQuizCompleted(false);
    setShowResultsPanel(false);
    setShowReview(false);
    setTimer(0);
    setIsPaused(false);
    
    // Set the filtered and shuffled questions as the new quiz questions
    setQuestions(shuffledIncorrectQuestions);
    
    // IMPORTANT: Set retry mode to true
    setIsRetryMode(true);
    
    // Clear any saved progress
    clearSavedProgress();
    
    // Notify the user
    toast.success(t('quiz.retryingIncorrectQuestions', {
      count: incorrectQuestionsOnly.length
    }));
  };

  const handleExitQuiz = () => {
    if (!quizCompleted) {
      saveProgress();
    }
    navigate(-1);
  };

  const handleQuit = () => {
    navigate(-1);
  };

  const handleBackFromReview = () => {
    setShowReview(false);
    setShowResultsPanel(true);
  };

  const handleBookmark = () => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
        toast.success("Question unbookmarked");
      } else {
        newSet.add(currentQuestionIndex);
        toast.success("Question bookmarked");
      }
      return newSet;
    });
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
    toast.success(isPaused ? "Quiz resumed" : "Quiz paused");
  };

  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-lg">{t('quiz.loading')}</p>
        </div>
      </div>
    );
  }

  if (!course || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">{t('quiz.noQuestions')}</h2>
          <Button onClick={() => navigate(-1)}>
            {t('ui.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <QuizReview 
        questions={questions}
        userAnswers={userAnswers}
        onBack={handleBackFromReview}
      />
    );
  }

  if (!quizSettings) {
    return (
      <div className="container py-8">
        <QuizSettings 
          onStart={handleQuizStart}
          courseName={getLocalizedText(course.title_en, course.title_fr, course.title)}
          questionCount={questions.length}
        />
        
        <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('quiz.continueOrRestart')}</DialogTitle>
              <DialogDescription>
                {t('quiz.continueQuiz')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex space-x-4">
              <Button onClick={handleContinueQuiz} className="flex-1">
                {t('quiz.continue')}
              </Button>
              <Button onClick={handleStartOverQuiz} variant="outline" className="flex-1">
                {t('quiz.startOver')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">{t('quiz.noQuestions')}</h2>
          <Button onClick={() => navigate(-1)}>
            {t('ui.back')}
          </Button>
        </div>
      </div>
    );
  }

  const selectedAnswers = userAnswers[currentQuestion.id] || [];

  if (showResultsPanel) {
    return (
      <QuizResultsPanel
        finalGrade={calculateGrade()}
        score={score}
        totalQuestions={questions.length}
        correctAnswers={correctQuestions.size}
        partiallyCorrectAnswers={partiallyCorrectQuestions.size}
        wrongAnswers={wrongQuestionIndexes.size}
        onViewQuestions={handleViewQuestions}
        onStartOver={handleStartOver}
        onRetryWrong={handleRetryWrong}
        onQuit={handleQuit}
      />
    );
  }

  // The main quiz view
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main question area (takes 3/4 of the width on large screens) */}
        <div className="lg:col-span-3 flex flex-col">
          <QcmBody
            questions={questions}
            correctQuestions={correctQuestions}
            partiallyCorrectQuestions={partiallyCorrectQuestions}
            currentQuestionIndex={currentQuestionIndex}
            selectedOptions={selectedAnswers}
            userAnswers={userAnswers}
            answeredQuestions={answeredQuestions}
            bookmarkedQuestions={bookmarkedQuestions}
            showResult={isRetryMode ? false : (showResult || isCurrentQuestionAnswered)}
            isCorrect={isCorrect}
            timer={timer}
            isPaused={isPaused}
            isRetryMode={isRetryMode}
            showSidebar={false} // This is the critical change - explicitly hide the built-in sidebar
            onOptionSelect={handleOptionSelect}
            onNext={handleNextQuestion}
            onPrevious={() => {
              // Allow going back in retry mode regardless of answered state
              if ((currentQuestionIndex > 0 && !answeredQuestions.has(currentQuestionIndex)) || isRetryMode) {
                setCurrentQuestionIndex(prev => prev - 1);
                const prevQuestion = questions[currentQuestionIndex - 1];
                const prevAnswers = userAnswers[prevQuestion.id] || [];
                setSelectedOptionId(prevAnswers[0] || null);
              }
            }}
            onSubmit={handleCheckAnswer}
            onFinish={finishQuiz}
            onBookmark={handleBookmark}
            onQuit={handleQuit}
            onPauseResume={handlePauseResume}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>

        {/* Sidebar with Progress and Notes (takes 1/4 of the width on large screens) */}
        <div className="lg:col-span-1 h-full">
          <QuizSidebar questionId={currentQuestion.id}>
            {/* Progress UI as children */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                {questions.map((_, index) => {
                  const isAnsweredQuestion = answeredQuestions.has(index);
                  const isCurrent = currentQuestionIndex === index;
                  const isBookmarked = bookmarkedQuestions.has(index);
                  const isCorrectAnswer = correctQuestions.has(index);
                  const isPartiallyCorrect = partiallyCorrectQuestions.has(index);
                  
                  let bgColor = "bg-gray-100";
                  let textColor = "text-gray-700";
                  
                  if (isAnsweredQuestion) {
                    if (isCorrectAnswer) {
                      bgColor = "bg-green-100";
                      textColor = "text-green-700";
                    } else if (isPartiallyCorrect) {
                      bgColor = "bg-yellow-100";
                      textColor = "text-yellow-700";
                    } else {
                      bgColor = "bg-red-100";
                      textColor = "text-red-700";
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full font-medium text-sm",
                        bgColor,
                        textColor,
                        isCurrent && "ring-2 ring-primary",
                        isBookmarked && "ring-2 ring-yellow-400",
                        !isAnsweredQuestion && "hover:bg-gray-200"
                      )}
                      onClick={() => handleQuestionSelect(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </QuizSidebar>
        </div>
      </div>
      
      {/* Quiz paused dialog */}
      <Dialog open={isPaused} onOpenChange={setIsPaused}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('quiz.paused')}</DialogTitle>
          </DialogHeader>
          <Button onClick={handlePauseResume}>
            {t('quiz.resume')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
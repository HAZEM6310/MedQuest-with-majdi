import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Course, Question, QuizSettings as QuizSettingsType, QuestionGroup } from "@/types";
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
import { quizService } from "@/services/quizService";

export default function Quiz() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const facultyId = searchParams.get('faculty');
  
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [partiallyCorrectQuestions, setPartiallyCorrectQuestions] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[questionId: string]: string[]}>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string[]}>({});
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [answeredGroups, setAnsweredGroups] = useState<Set<string>>(new Set());
  const [correctQuestions, setCorrectQuestions] = useState<Set<string>>(new Set());
  const [wrongQuestions, setWrongQuestions] = useState<Set<string>>(new Set());
  const [bookmarkedGroups, setBookmarkedGroups] = useState<Set<string>>(new Set());
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [completedQuizData, setCompletedQuizData] = useState<any>(null);
  const dataFetchedRef = useRef(false);
  const hasInitializedProgress = useRef(false);

  // Current group and its questions
  const currentGroup = questionGroups[currentGroupIndex];
  const currentGroupQuestions = questions.filter(q => q.group_id === currentGroup?.id)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // Initialize quiz once
  useEffect(() => {
    if (dataFetchedRef.current) return;
    if (!courseId || !user?.id) return;

    dataFetchedRef.current = true;
    const initializeQuiz = async () => {
      try {
        console.log("Initializing quiz for course:", courseId);
        // Load course and questions, but don't check for completed quizzes
        await fetchCourseAndQuestions();
        
        // Only check for in-progress quizzes (not completed ones)
        setTimeout(async () => {
          await checkExistingProgress();
        }, 500);
      } catch (error) {
        console.error("Error initializing quiz:", error);
      }
    };

    initializeQuiz();
  }, [courseId, user?.id]);

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
  }, [quizSettings, quizCompleted, questionsAnswered, userAnswers, currentGroupIndex]);

  // Create initial progress record when quiz starts
  useEffect(() => {
    const createInitialProgress = async () => {
      if (!courseId || !user?.id || hasInitializedProgress.current || !quizSettings) return;
      
      hasInitializedProgress.current = true;
      
      try {
        // First check if there's already an in-progress quiz for this course
        if (!progressId) {
          const { data: existingProgress, error } = await supabase
            .from('quiz_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('is_completed', false)
            .single();
            
          if (existingProgress?.id) {
            console.log("Found existing progress record with ID:", existingProgress.id);
            setProgressId(existingProgress.id);
            // Update the existing record
            await saveProgressToSupabase(false);
            return;
          }
        }
        
        // If we don't have an existing record, create a new one
        console.log("Creating initial quiz progress record...");
        await saveProgressToSupabase(true);
      } catch (error) {
        console.error("Error in createInitialProgress:", error);
      }
    };

    // If we have quiz settings but no progressId yet, create initial progress
    if (quizSettings && !hasInitializedProgress.current) {
      createInitialProgress();
    }
  }, [quizSettings, progressId, courseId, user?.id]);

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    // Function to handle before unload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizSettings && !quizCompleted && questionsAnswered > 0) {
        // Save to localStorage as a backup (synchronous)
        if (progressId) {
          localStorage.setItem(`quiz_time_${progressId}`, timer.toString());
          localStorage.setItem(`quiz_answers_${progressId}`, JSON.stringify(userAnswers));
          localStorage.setItem(`quiz_progress_state_${progressId}`, JSON.stringify({
            score,
            questionsAnswered,
            currentGroupIndex
          }));
        }
        
        // This may not complete if the page closes too quickly
        saveProgressToSupabase();
        
        // Standard way to show dialog when leaving page
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // Function to handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && 
          quizSettings && !quizCompleted && questionsAnswered > 0) {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Save progress when component unmounts
      if (quizSettings && !quizCompleted && questionsAnswered > 0) {
        saveProgress();
      }
    };
  }, [quizSettings, quizCompleted, questionsAnswered, userAnswers, timer, progressId, score, currentGroupIndex]);

  // Check if user has already completed this quiz
  const checkCompletedQuiz = async () => {
    if (!user?.id || !courseId) return false;
    
    try {
      console.log("Checking for completed quiz...");
      
      // Get current date in ISO format (for filtering)
      const currentDate = new Date().toISOString();
      
      const { data: completedQuiz, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', true)
        .lt('updated_at', currentDate) // Only get quizzes with dates before now (avoid future dates)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found is okay
          console.error('Error checking completed quiz:', error);
        }
        return false;
      }

      if (completedQuiz) {
        // Check if the completed quiz date is in the future (likely a data error)
        const completedDate = new Date(completedQuiz.updated_at);
        const currentDate = new Date();
        
        if (completedDate > currentDate) {
          console.error('Found completed quiz with future date:', completedQuiz);
          // Don't show dialogs for quizzes with future dates - this is likely an error
          return false;
        }
        
        console.log('Found completed quiz:', completedQuiz);
        setCompletedQuizData(completedQuiz);
        setShowCompletedDialog(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking completed quiz:', error);
      return false;
    }
  };

  const checkExistingProgress = async () => {
    if (!user?.id || !courseId) {
      console.log("Cannot check progress: missing user or courseId");
      return false;
    }
    
    try {
      console.log("Checking for existing progress...");
      const { data: savedProgress, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false })
        .single();

      console.log("Progress check result:", { 
        savedProgress, 
        hasData: !!savedProgress, 
        error,
        hasAnswers: savedProgress && savedProgress.user_answers && 
          Object.keys(savedProgress.user_answers || {}).length > 0
      });

      if (error) {
        if (error.code !== 'PGRST116') { // Not found is okay
          console.error('Error checking progress:', error);
        }
        return false;
      }

      // Store progress ID for future updates
      if (savedProgress?.id) {
        setProgressId(savedProgress.id);
        console.log("Set progressId to:", savedProgress.id);
      }

      // Make sure progress exists and has meaningful data
      if (savedProgress && 
          savedProgress.questions_answered > 0 && 
          savedProgress.user_answers && 
          Object.keys(savedProgress.user_answers || {}).length > 0) {
        
        console.log('Found existing progress with answers:', savedProgress);
        setHasExistingProgress(true);
        
        // Force dialog to open with a slight delay
        setTimeout(() => {
          setShowContinueDialog(true);
        }, 300);
        return true;
      } else {
        console.log("No valid progress found or progress has no answers");
        return false;
      }
    } catch (error) {
      console.error('Error in checkExistingProgress:', error);
      return false;
    }
  };

  // Load completed quiz for review
  const loadCompletedQuiz = () => {
    if (!completedQuizData) return;
    
    try {
      console.log("Loading completed quiz for review");
      
      // Set the user answers from the completed quiz
      if (completedQuizData.user_answers && typeof completedQuizData.user_answers === 'object') {
        const answersCopy = JSON.parse(JSON.stringify(completedQuizData.user_answers));
        setUserAnswers(answersCopy);
      }
      
      // Set quiz as completed and show review
      setQuizCompleted(true);
      setShowReview(true);
      setShowCompletedDialog(false);
      
    } catch (error) {
      console.error('Error loading completed quiz:', error);
      toast.error('Error loading your completed quiz');
    }
  };

  const loadSavedProgress = async () => {
    if (!user?.id || !courseId) return;
    
    startLoading(t('quiz.loading'));
    
    try {
      console.log("Loading saved progress...");
      const { data: savedProgress, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .single();

      console.log("Load progress result:", { savedProgress, error });

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error loading progress:', error);
        }
        stopLoading();
        return;
      }

      if (!savedProgress) {
        console.log("No saved progress found");
        stopLoading();
        return;
      }

      // Store progress ID for future updates
      if (savedProgress.id) {
        setProgressId(savedProgress.id);
      }

      // Set the current group index (protect against invalid index)
      if (typeof savedProgress.current_question === 'number') {  // Changed from current_group to current_question
        setCurrentGroupIndex(Math.min(
          savedProgress.current_question, 
          questionGroups.length - 1
        ));
      }
      
      // Process user answers
      if (savedProgress.user_answers && typeof savedProgress.user_answers === 'object') {
        const answerData = savedProgress.user_answers;
        // Create a safe copy to prevent reference issues
        const answersCopy = JSON.parse(JSON.stringify(answerData));
        setUserAnswers(answersCopy);
        
        // Create selected options map
        const selectedOpts: {[questionId: string]: string[]} = {};
        Object.entries(answersCopy).forEach(([questionId, answers]) => {
          // Handle different answer formats
          if (Array.isArray(answers)) {
            selectedOpts[questionId] = answers;
          } else if (typeof answers === 'object' && answers.selected_options) {
            selectedOpts[questionId] = answers.selected_options;
          }
        });
        setSelectedOptions(selectedOpts);
        
        // Reconstruct answer states
        const answeredQs = new Set<string>();
        const answeredGs = new Set<string>();
        const correctQs = new Set<string>();
        const wrongQs = new Set<string>();
        const partialQs = new Set<string>();
        
        // Restore partially correct questions
        if (savedProgress.partially_correct_questions && 
            Array.isArray(savedProgress.partially_correct_questions)) {
          savedProgress.partially_correct_questions.forEach((id: string) => {
            if (questions.some(q => q.id === id)) {
              partialQs.add(id);
            }
          });
        }
        
        // Process each answered question
        Object.entries(answersCopy).forEach(([questionId, answers]) => {
          const question = questions.find(q => q.id === questionId);
          if (!question) return;
          
          answeredQs.add(questionId);
          
          if (question.group_id) {
            answeredGs.add(question.group_id);
          }
          
          // Evaluate correctness if not already determined
          if (partialQs.has(questionId)) {
            // Already marked as partially correct
          } else if (typeof answers === 'object' && 'is_correct' in answers) {
            // Use saved correctness info
            if (answers.is_correct) {
              correctQs.add(questionId);
            } else {
              wrongQs.add(questionId);
            }
          } else {
            // Need to evaluate correctness
            const answerArray = Array.isArray(answers) ? answers : [];
            const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
            
            const isFullyCorrect = answerArray.length === correctOptions.length &&
              answerArray.every(answerId => correctOptions.some(opt => opt.id === answerId));
            
            const isPartiallyCorrect = answerArray.length < correctOptions.length && 
              answerArray.every(answerId => correctOptions.some(opt => opt.id === answerId)) &&
              answerArray.length > 0;
            
            if (isFullyCorrect) {
              correctQs.add(questionId);
            } else if (isPartiallyCorrect) {
              partialQs.add(questionId);
            } else {
              wrongQs.add(questionId);
            }
          }
        });
        
        setAnsweredQuestions(answeredQs);
        setAnsweredGroups(answeredGs);
        setCorrectQuestions(correctQs);
        setWrongQuestions(wrongQs);
        setPartiallyCorrectQuestions(partialQs);
      }
      
      // Restore other state
      if (typeof savedProgress.score === 'number') {
        setScore(savedProgress.score);
      }
      
      if (typeof savedProgress.questions_answered === 'number') {
        setQuestionsAnswered(savedProgress.questions_answered);
      }
      
      if (Array.isArray(savedProgress.wrong_answers)) {
        setWrongAnswers(savedProgress.wrong_answers);
      }
      
      // Restore time from localStorage if available
      const savedTime = localStorage.getItem(`quiz_time_${savedProgress.id}`);
      if (savedTime) {
        setTimer(parseInt(savedTime));
      }
      
      console.log("Progress restored successfully");
      toast.success(t('quiz.progress.loaded'));
      
      // Update timestamp to show we're actively working on this quiz
      await supabase
        .from('quiz_progress')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', savedProgress.id);
        
    } catch (error) {
      console.error('Error loading saved progress:', error);
      toast.error(t('quiz.progress.loadError'));
    } finally {
      stopLoading();
    }
  };

  const clearSavedProgress = async () => {
    if (!user?.id || !courseId) return;

    try {
      console.log("Clearing existing progress...");
      // First clear any localStorage items
      if (progressId) {
        localStorage.removeItem(`quiz_time_${progressId}`);
        localStorage.removeItem(`quiz_answers_${progressId}`);
        localStorage.removeItem(`quiz_progress_state_${progressId}`);
      }
      
      // Then delete from database
      const { error } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', false);

      if (error) {
        console.error("Error clearing progress:", error);
        throw error;
      }
      
      setProgressId(null);
      console.log("Progress cleared successfully");
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  const saveProgress = async () => {
    if (!user?.id || !courseId || !questionGroups.length) {
      console.log("Cannot save progress: missing user, courseId, or questionGroups");
      return;
    }
  
    try {
      console.log("Saving progress...");
      await saveProgressToSupabase();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Helper function for direct Supabase save
  const saveProgressToSupabase = async (isInitial = false) => {
    if (!user?.id || !courseId) {
      console.error("Cannot save to Supabase: missing user or courseId", { user: user?.id, courseId });
      return;
    }
    
    try {
      console.log(`${isInitial ? "Creating initial" : "Saving"} progress to Supabase...`, { 
        userId: user?.id, 
        courseId, 
        currentGroupIndex,
        progressId
      });
      
      // Ensure we have a clean copy of user answers to prevent reference issues
      const cleanUserAnswers = JSON.parse(JSON.stringify(userAnswers));
      
      // Prepare progress data with only fields that exist in the table
      // Removed the current_group field that was causing the error
      const progressData = {
        user_id: user.id,
        course_id: courseId,
        current_question: currentGroupIndex, // Use current_question instead of current_group
        user_answers: cleanUserAnswers,
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        questions_answered: questionsAnswered,
        wrong_answers: wrongAnswers ? [...wrongAnswers] : [],
        partially_correct_questions: Array.from(partiallyCorrectQuestions),
        is_completed: false,
        updated_at: new Date().toISOString()
      };

      console.log("Progress data prepared:", progressData);

      let result;
      
      // If we have an ID, use update, otherwise insert new record
      if (progressId && !isInitial) {
        console.log("Updating existing progress with ID:", progressId);
        result = await supabase
          .from('quiz_progress')
          .update(progressData)
          .eq('id', progressId)
          .select();
        
        console.log("Update result:", result);
      } else {
        console.log("Creating new progress record or updating existing one");
        // For new records, include created_at
        const newProgressData = {
          ...progressData,
          created_at: new Date().toISOString()
        };
        
        // Use upsert instead of insert to handle duplicate key conflicts
        result = await supabase
          .from('quiz_progress')
          .upsert([newProgressData], { 
            onConflict: 'user_id,course_id',
            ignoreDuplicates: false  // Update the existing record if found
          })
          .select();
        
        console.log("Upsert result:", result);
      }
      
      const { data, error } = result;
    
      if (error) {
        console.error("Error saving/creating progress:", error);
        
        // If this is a duplicate key error, try to retrieve the existing record instead
        if (error.code === '23505' && !progressId) {
          console.log("Handling duplicate key error - retrieving existing record");
          
          try {
            // Fetch the existing record
            const { data: existingRecord, error: fetchError } = await supabase
              .from('quiz_progress')
              .select('id')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .eq('is_completed', false)
              .single();
              
            if (fetchError) {
              console.error("Error fetching existing record:", fetchError);
              throw error; // Throw the original error if we can't fetch
            }
            
            if (existingRecord) {
              // Set the progress ID from the existing record
              setProgressId(existingRecord.id);
              console.log("Retrieved existing progress ID:", existingRecord.id);
              
              // Now try updating this record
              const { error: updateError } = await supabase
                .from('quiz_progress')
                .update(progressData)
                .eq('id', existingRecord.id);
                
              if (updateError) {
                console.error("Error updating existing record:", updateError);
                throw updateError;
              }
              
              // Successfully handled the duplicate key issue
              return true;
            }
          } catch (innerError) {
            console.error("Error handling duplicate key:", innerError);
          }
        }
        
        throw error;
      }
      
      if (data && data.length > 0) {
        // Store the ID for future updates
        setProgressId(data[0].id);
        console.log("Progress saved with ID:", data[0].id);
        
        // Also save time remaining to localStorage as backup
        localStorage.setItem(`quiz_time_${data[0].id}`, timer.toString());
        return true;
      } else {
        console.warn("No data returned after saving progress");
      }
      
      return false;
    } catch (error) {
      console.error('Error in saveProgressToSupabase:', error);
      return false;
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

      // First fetch question groups
      let groupsQuery = supabase
        .from('question_groups')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true }); // Order groups consistently by order_index
        
      // Apply faculty filter if selected
      if (facultyId && facultyId !== 'all') {
        groupsQuery = groupsQuery.eq('faculty_id', facultyId);
      }
      
      const { data: groupsData, error: groupsError } = await groupsQuery;
      
      if (groupsError) throw groupsError;

      let allGroups = [];
      let allQuestions = [];
      
      // Step 1: Process clinical case groups (if any)
      if (groupsData && groupsData.length > 0) {
        // Use the existing groups
        allGroups = [...groupsData];
        
        // Fetch questions in these groups
        let groupedQuestionsQuery = supabase
          .from('questions')
          .select(`
            *,
            options (*)
          `)
          .eq('course_id', courseId)
          .in('group_id', groupsData.map(g => g.id))
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });
          
        if (facultyId && facultyId !== 'all') {
          groupedQuestionsQuery = groupedQuestionsQuery.eq('faculty_id', facultyId);
        }
        
        const { data: groupedQuestionsData, error: groupedQuestionsError } = await groupedQuestionsQuery;
        
        if (groupedQuestionsError) throw groupedQuestionsError;
        
        if (groupedQuestionsData && groupedQuestionsData.length > 0) {
          allQuestions = [...groupedQuestionsData];
        }
      }
      
      // Step 2: Always fetch standalone questions too (without a group)
      let standaloneQuestionsQuery = supabase
        .from('questions')
        .select(`
          *,
          options (*)
        `)
        .eq('course_id', courseId)
        .is('group_id', null) // Only fetch questions that aren't in a group
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });
        
      if (facultyId && facultyId !== 'all') {
        standaloneQuestionsQuery = standaloneQuestionsQuery.eq('faculty_id', facultyId);
      }
      
      const { data: standaloneQuestionsData, error: standaloneQuestionsError } = await standaloneQuestionsQuery;
      
      if (standaloneQuestionsError) throw standaloneQuestionsError;
      
      // Step 3: Process standalone questions into virtual groups
      if (standaloneQuestionsData && standaloneQuestionsData.length > 0) {
        // Create virtual groups for standalone questions
        const startIndex = allGroups.length; // Start after existing groups
        const virtualGroups = standaloneQuestionsData.map((q, i) => ({
          id: `virtual-group-${q.id}`,
          title: `Question ${startIndex + i + 1}`,
          description: q.text,
          course_id: courseId || '',
          faculty_id: q.faculty_id,
          order_index: startIndex + i,
          created_at: new Date().toISOString(),
          is_single_question: true // Flag to identify standalone questions
        }));
        
        // Assign each standalone question to its virtual group
        const questionsWithVirtualGroups = standaloneQuestionsData.map((q) => ({
          ...q,
          group_id: `virtual-group-${q.id}`,
          order_index: 0 // Only question in the group
        }));
        
        // Add to our collections
        allGroups = [...allGroups, ...virtualGroups];
        allQuestions = [...allQuestions, ...questionsWithVirtualGroups];
      }
      
      // Set the state with all questions and groups
      setQuestionGroups(allGroups);
      setQuestions(allQuestions);
      
      console.log("Questions and groups loaded successfully");
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('quiz.errorLoading'));
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
    setShowCompletedDialog(false);
    clearSavedProgress();
    // Reset all state
    setCurrentGroupIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});
    setSelectedOptions({});
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setAnsweredGroups(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestions(new Set());
    setPartiallyCorrectQuestions(new Set());
    setProgressId(null);
    setCompletedQuizData(null);
    setQuizSettings(null); // Reset quiz settings to show the settings page
  };

  // Handle reviewing a completed quiz
  const handleReviewCompleted = () => {
    setShowCompletedDialog(false);
    loadCompletedQuiz();
  };

  const handleGroupSelect = (groupIndex: number) => {
    if (quizCompleted) {
      setCurrentGroupIndex(groupIndex);
      return;
    }
    
    if (showResult && !isRetryMode) return;
    
    setCurrentGroupIndex(groupIndex);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    // Allow selection in retry mode, or if not showing results
    if (showResult && !isRetryMode && answeredQuestions.has(questionId)) return;
  
    setSelectedOptions(prev => {
      const currentAnswers = prev[questionId] || [];
      let newAnswers;
      
      if (currentAnswers.includes(optionId)) {
        newAnswers = currentAnswers.filter(id => id !== optionId);
      } else {
        newAnswers = [...currentAnswers, optionId];
      }
      
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
  };

  const handleCheckAnswers = async () => {
    if (!currentGroup || !quizSettings || !currentGroupQuestions.length) return;
    
    // Check that all questions have at least one answer
    const allQuestionsHaveSelection = currentGroupQuestions.every(
      question => (selectedOptions[question.id] || []).length > 0
    );
    
    if (!allQuestionsHaveSelection) return;
    
    let newCorrectQuestions = new Set(correctQuestions);
    let newPartiallyCorrect = new Set(partiallyCorrectQuestions);
    let newWrongQuestions = new Set(wrongQuestions);
    let newWrongAnswers = [...wrongAnswers];
    let newAnsweredQuestions = new Set(answeredQuestions);
    let questionScoreSum = 0;
    
    // Create a copy of current user answers
    const updatedUserAnswers = {...userAnswers};
    
    // Process each question in the group
    for (const question of currentGroupQuestions) {
      const selectedAnswersForQuestion = selectedOptions[question.id] || [];
      if (selectedAnswersForQuestion.length === 0) continue;
      
      // Update user answers directly
      updatedUserAnswers[question.id] = selectedAnswersForQuestion;
      
      const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
      
      // Check if answer is fully correct (all correct options selected, no incorrect ones)
      const isFullyCorrect = selectedAnswersForQuestion.length === correctOptions.length &&
        selectedAnswersForQuestion.every(answerId => correctOptions.some(opt => opt.id === answerId));
      
      // Check if answer is partially correct (some correct options selected, no incorrect ones)
      const isPartiallyCorrect = selectedAnswersForQuestion.length < correctOptions.length && 
        selectedAnswersForQuestion.every(answerId => correctOptions.some(opt => opt.id === answerId)) &&
        selectedAnswersForQuestion.length > 0;
                                 
      newAnsweredQuestions.add(question.id);
      
      if (isFullyCorrect) {
        newCorrectQuestions.add(question.id);
        questionScoreSum += 1;
      } else if (isPartiallyCorrect) {
        newPartiallyCorrect.add(question.id);
        // Give partial credit
        questionScoreSum += (selectedAnswersForQuestion.length / correctOptions.length) * 0.5;
      } else {
        newWrongQuestions.add(question.id);
        newWrongAnswers.push(question.id);
      }
    }
    
    // Mark group as answered
    if (currentGroup.id) {
      setAnsweredGroups(prev => new Set(prev).add(currentGroup.id));
    }
    
    // Update state with all the new values
    setCorrectQuestions(newCorrectQuestions);
    setPartiallyCorrectQuestions(newPartiallyCorrect);
    setWrongQuestions(newWrongQuestions);
    setWrongAnswers(newWrongAnswers);
    setAnsweredQuestions(newAnsweredQuestions);
    setQuestionsAnswered(prev => prev + currentGroupQuestions.length);
    setUserAnswers(updatedUserAnswers);
    
    // Update score with the sum from all questions in this group
    setScore(prev => Math.round((prev + questionScoreSum) * 100) / 100); // Round to 2 decimal places

    // In retry mode, never show results immediately - move to next group
    if (isRetryMode) {
      setTimeout(() => {
        handleNextGroup();
      }, 500);
    } else if (quizSettings.showAnswersImmediately) {
      setShowResult(true);
    } else {
      setTimeout(() => {
        handleNextGroup();
      }, 500);
    }

    // Explicitly save progress after answering with a delay to ensure state is updated
    setTimeout(() => {
      saveProgress();
    }, 1000);
  };

  const handleNextGroup = () => {
    setShowResult(false);
    
    if (currentGroupIndex < questionGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      // Save progress after changing group
      setTimeout(() => {
        saveProgress();
      }, 300);
    } else {
      finishQuiz();
    }
  };

  const handlePreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      setShowResult(false);
    }
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

  const finishQuiz = async () => {
    const finalGrade = calculateGrade();
    setQuizCompleted(true);
    setIsRetryMode(false); // Turn off retry mode when finishing
    
    if (user?.id && courseId) {
      try {
        console.log("Saving final quiz results");
        
        // Create a clean copy of the final data
        const finalData = {
          user_id: user.id,
          course_id: courseId,
          current_question: questionGroups.length,  // Changed from current_group to current_question
          user_answers: JSON.parse(JSON.stringify(userAnswers)),
          score: Math.round(score * 100) / 100, // Round to 2 decimal places
          questions_answered: questionsAnswered,
          wrong_answers: Array.from(wrongQuestions),
          partially_correct_questions: Array.from(partiallyCorrectQuestions),
          is_completed: true,
          final_grade: finalGrade,
          updated_at: new Date().toISOString()
        };

        // Save final results
        let result;
        if (progressId) {
          result = await supabase
            .from('quiz_progress')
            .update(finalData)
            .eq('id', progressId);
        } else {
          // Check if there's already a completed quiz record
          const { data: existingProgress } = await supabase
            .from('quiz_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();
            
          if (existingProgress?.id) {
            // Update existing record
            result = await supabase
              .from('quiz_progress')
              .update(finalData)
              .eq('id', existingProgress.id);
          } else {
            // Create new record
            result = await supabase
              .from('quiz_progress')
              .upsert([finalData], { 
                onConflict: 'user_id,course_id',
                ignoreDuplicates: false // Update on conflict
              });
          }
        }

        const { error } = result;
        if (error) throw error;
        
        // Remove time from localStorage when quiz is completed
        if (progressId) {
          localStorage.removeItem(`quiz_time_${progressId}`);
          localStorage.removeItem(`quiz_answers_${progressId}`);
          localStorage.removeItem(`quiz_progress_state_${progressId}`);
        }
        
        console.log("Final quiz results saved successfully");
      } catch (error) {
        console.error('Error saving final progress:', error);
        toast.error("Could not save your final results");
      }
    }

    // Always show results panel
    setShowResultsPanel(true);
  };

  const handleQuizStart = (settings: QuizSettingsType) => {
    setQuizSettings(settings);
    setTimer(0);
    setIsPaused(false);
    
    // Create initial progress record after a short delay
    setTimeout(() => {
      saveProgressToSupabase(true);
    }, 500);
  };

  const handleViewQuestions = () => {
    setShowResultsPanel(false);
    setShowReview(true);
  };

  const handleStartOver = () => {
    setCurrentGroupIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});
    setSelectedOptions({});
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setAnsweredGroups(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestions(new Set());
    setPartiallyCorrectQuestions(new Set());
    setBookmarkedGroups(new Set());
    setQuizCompleted(false);
    setShowResultsPanel(false);
    setShowReview(false);
    setQuizSettings(null);
    setTimer(0);
    setIsPaused(false);
    setIsRetryMode(false);
    setProgressId(null);
    setCompletedQuizData(null);
    hasInitializedProgress.current = false; // Reset this flag
    clearSavedProgress();
    fetchCourseAndQuestions(); // Refetch to get fresh questions
  };

  const handleRetryWrong = () => {
    // Get all question IDs that were not fully correct
    const incorrectQuestionIds = new Set([
      ...Array.from(wrongQuestions), // Completely wrong answers
      ...Array.from(partiallyCorrectQuestions) // Partially correct answers
    ]);
    
    // Filter the questions and groups to only include incorrect ones
    const incorrectQuestionsOnly = questions.filter(q => incorrectQuestionIds.has(q.id));
    
    if (incorrectQuestionsOnly.length === 0) {
      toast.info(t('quiz.noQuestionsToRetry'));
      return;
    }
    
    // Get unique group IDs from incorrect questions
    const incorrectGroupIds = new Set(incorrectQuestionsOnly.map(q => q.group_id));
    const incorrectGroupsOnly = questionGroups.filter(g => incorrectGroupIds.has(g.id));
    
    // Reset all state
    setCurrentGroupIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setUserAnswers({});
    setSelectedOptions({});
    setWrongAnswers([]);
    setAnsweredQuestions(new Set());
    setAnsweredGroups(new Set());
    setCorrectQuestions(new Set());
    setWrongQuestions(new Set());
    setPartiallyCorrectQuestions(new Set());
    setBookmarkedGroups(new Set());
    setShowResult(false);
    setQuizCompleted(false);
    setShowResultsPanel(false);
    setShowReview(false);
    setTimer(0);
    setIsPaused(false);
    setProgressId(null);
    setCompletedQuizData(null);
    hasInitializedProgress.current = false; // Reset this flag
    
    // Set filtered questions and groups
    setQuestions(incorrectQuestionsOnly);
    setQuestionGroups(incorrectGroupsOnly);
    
    // IMPORTANT: Set retry mode to true
    setIsRetryMode(true);
    
    // Clear any saved progress
    clearSavedProgress();
    
    // Notify the user
    toast.success(t('quiz.retryingIncorrectQuestions', {
      count: incorrectQuestionsOnly.length
    }));
  };

  const handleBookmark = () => {
    if (!currentGroup) return;
    
    setBookmarkedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentGroup.id)) {
        newSet.delete(currentGroup.id);
        toast.success(t('quiz.unbookmarked'));
      } else {
        newSet.add(currentGroup.id);
        toast.success(t('quiz.bookmarked'));
      }
      return newSet;
    });
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
    toast.success(isPaused ? t('quiz.resumed') : t('quiz.paused'));
    
    // Save progress when pausing
    if (!isPaused) {
      saveProgress();
    }
  };

  const handleQuit = () => {
    // Save progress before quitting
    if (quizSettings && !quizCompleted && questionsAnswered > 0) {
      saveProgress();
    }
    navigate(-1);
  };

  const handleBackFromReview = () => {
    setShowReview(false);
    setShowResultsPanel(true);
  };

  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  // Handle timer update (for QuizTimer)
  const handleTimeUpdate = (remainingSeconds: number) => {
    setTimer(remainingSeconds);
    
    // Save time periodically
    if (remainingSeconds % 60 === 0 && progressId) { // Save every minute
      localStorage.setItem(`quiz_time_${progressId}`, remainingSeconds.toString());
    }
  };
  
  // Handle timer expiry
  const handleTimeExpired = () => {
    toast.error(t('quiz.timeExpired'));
    finishQuiz();
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

  if (!course || questionGroups.length === 0 || questions.length === 0) {
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
        
        {/* Button to check previous attempts */}
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              await checkCompletedQuiz();
            }}
          >
            {t('quiz.viewPreviousAttempts')}
          </Button>
        </div>
        
        {/* Continue dialog for in-progress quizzes */}
        <Dialog 
          open={showContinueDialog} 
          onOpenChange={(open) => {
            console.log("Continue dialog open state changed:", open);
            setShowContinueDialog(open);
          }}
        >
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
        
        {/* Dialog for completed quizzes */}
        <Dialog 
          open={showCompletedDialog} 
          onOpenChange={(open) => {
            console.log("Completed dialog open state changed:", open);
            setShowCompletedDialog(open);
            
            // If dialog is closed by the user clicking outside,
            // allow them to continue to start a new quiz
            if (!open) {
              setQuizSettings(null); // Reset quiz settings to show the settings page
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('quiz.completedQuiz')}</DialogTitle>
              <DialogDescription>
                {t('quiz.completedQuizDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              {completedQuizData && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">{t('quiz.completedOn')}</p>
                  <p className="font-medium">
                    {new Date(completedQuizData.updated_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{t('quiz.finalGrade')}</p>
                  <p className="font-bold text-xl">
                    {completedQuizData.final_grade} / 20
                  </p>
                </div>
              )}
              <div className="flex space-x-4">
                <Button onClick={handleReviewCompleted} className="flex-1">
                  {t('quiz.reviewAnswers')}
                </Button>
                <Button onClick={handleStartOverQuiz} variant="outline" className="flex-1">
                  {t('quiz.retakeQuiz')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!currentGroup) {
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

  if (showResultsPanel) {
    return (
      <QuizResultsPanel
        finalGrade={calculateGrade()}
        score={score}
        totalQuestions={questions.length}
        correctAnswers={correctQuestions.size}
        partiallyCorrectAnswers={partiallyCorrectQuestions.size}
        wrongAnswers={wrongQuestions.size}
        onViewQuestions={handleViewQuestions}
        onStartOver={handleStartOver}
        onRetryWrong={handleRetryWrong}
        onQuit={handleQuit}
      />
    );
  }

  // The main quiz view with questions (both standalone and clinical cases)
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main question area (takes 3/4 of the width on large screens) */}
        <div className="lg:col-span-3 flex flex-col">
          <QcmBody
            questions={questions}
            questionGroups={questionGroups}
            currentGroupIndex={currentGroupIndex}
            selectedOptions={selectedOptions}
            userAnswers={userAnswers}
            answeredGroups={answeredGroups}
            correctQuestions={correctQuestions}
            partiallyCorrectQuestions={partiallyCorrectQuestions}
            bookmarkedGroups={bookmarkedGroups}
            showResult={showResult}
            timer={timer}
            isPaused={isPaused}
            isRetryMode={isRetryMode}
            showSidebar={false}
            onOptionSelect={handleOptionSelect}
            onNext={handleNextGroup}
            onPrevious={handlePreviousGroup}
            onSubmit={handleCheckAnswers}
            onFinish={finishQuiz}
            onBookmark={handleBookmark}
            onQuit={handleQuit}
            onPauseResume={handlePauseResume}
            onGroupSelect={handleGroupSelect}
          />
        </div>

        {/* Sidebar with Progress and Notes (takes 1/4 of the width on large screens) */}
        <div className="lg:col-span-1 h-full">
          <QuizSidebar questionId={currentGroupQuestions[0]?.id || ''}>
            {/* Progress UI as children */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                {questionGroups.map((group, index) => {
                  // Get questions for this group
                  const groupQs = questions.filter(q => q.group_id === group.id);
                  const isGroupAnswered = group.id && answeredGroups.has(group.id);
                  
                  // Check if all questions in the group are correct
                  const allCorrect = groupQs.length > 0 && 
                    groupQs.every(q => correctQuestions.has(q.id));
                  
                  // Check if some questions are correct or partially correct
                  const someCorrect = !allCorrect && 
                    groupQs.some(q => correctQuestions.has(q.id) || partiallyCorrectQuestions.has(q.id));
                  
                  const isCurrent = currentGroupIndex === index;
                  const isBookmarked = bookmarkedGroups.has(group.id);
                  
                  let bgColor = "bg-gray-100";
                  let textColor = "text-gray-700";
                  
                  if (isGroupAnswered) {
                    if (allCorrect) {
                      bgColor = "bg-green-100";
                      textColor = "text-green-700";
                    } else if (someCorrect) {
                      bgColor = "bg-yellow-100";
                      textColor = "text-yellow-700";
                    } else {
                      bgColor = "bg-red-100";
                      textColor = "text-red-700";
                    }
                  }
                  
                  return (
                    <button
                      key={group.id}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full font-medium text-sm",
                        bgColor,
                        textColor,
                        isCurrent && "ring-2 ring-primary",
                        isBookmarked && "ring-2 ring-yellow-400",
                        !isGroupAnswered && "hover:bg-gray-200"
                      )}
                      onClick={() => handleGroupSelect(index)}
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
import { supabase } from '@/integrations/supabase/client'; // Fixed import path

export interface QuizProgress {
  id: string;
  current_question: number;
  user_answers: Record<string, {
    selected_options: string[];
    is_correct: boolean;
  }>;
  score: number;
  questions_answered: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  text: string;
  text_fr: string;
  explanation: string;
  explanation_fr: string;
  options: {
    id: string;
    text: string;
    text_fr: string;
    is_correct?: boolean;
  }[];
}

export interface QuizState {
  progressId: string;
  questions: Question[];
  totalQuestions: number;
  currentQuestion: number;
  userAnswers: Record<string, {
    selected_options: string[];
    is_correct: boolean;
  }>;
  score: number;
  questionsAnswered: number;
  isCompleted: boolean;
  timeRemaining?: number;
}

export const quizService = {
  /**
   * Start a new quiz attempt
   */
  async startQuiz(courseId: string): Promise<QuizState | null> {
    try {
      const userId = supabase.auth.user()?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Check for existing progress first (to avoid duplicates)
      const { data: existingProgress } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .single();
        
      if (existingProgress) {
        // We have existing progress, delete it before starting a new quiz
        await supabase
          .from('quiz_progress')
          .delete()
          .eq('id', existingProgress.id);
      }
      
      // Create a new progress record
      const { data: newProgress, error: createError } = await supabase
        .from('quiz_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          current_question: 0,
          user_answers: {},
          score: 0,
          questions_answered: 0,
          is_completed: false,
        }])
        .select('*')
        .single();
      
      if (createError || !newProgress) {
        console.error('Error creating quiz progress:', createError);
        throw new Error('Failed to start quiz');
      }
      
      // Now fetch questions for this course
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          options (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw new Error('Failed to fetch questions');
      }
      
      return {
        progressId: newProgress.id,
        questions: questionsData || [],
        totalQuestions: questionsData?.length || 0,
        currentQuestion: 0,
        userAnswers: {},
        score: 0,
        questionsAnswered: 0,
        isCompleted: false
      };
    } catch (error) {
      console.error('Failed to start quiz:', error);
      return null;
    }
  },

  /**
   * Check if user has an ongoing quiz attempt
   */
  async checkQuizProgress(courseId: string): Promise<QuizProgress | null> {
    try {
      const userId = supabase.auth.user()?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking quiz progress:', error);
      return null;
    }
  },

  /**
   * Resume an existing quiz attempt
   */
  async resumeQuiz(courseId: string): Promise<QuizState | null> {
    try {
      const userId = supabase.auth.user()?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get the existing progress
      const { data: progress, error: progressError } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (progressError) {
        if (progressError.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw progressError;
      }
      
      if (!progress) {
        throw new Error('No quiz progress found to resume');
      }
      
      // Update the timestamp
      await supabase
        .from('quiz_progress')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', progress.id);
      
      // Fetch questions for this course
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          options (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw new Error('Failed to fetch questions');
      }
      
      // Restore time from localStorage if available
      let timeRemaining: number | undefined = undefined;
      const savedTime = localStorage.getItem(`quiz_time_${progress.id}`);
      if (savedTime) {
        timeRemaining = parseInt(savedTime);
      }
      
      return {
        progressId: progress.id,
        questions: questionsData || [],
        totalQuestions: questionsData?.length || 0,
        currentQuestion: progress.current_group || progress.current_question || 0,
        userAnswers: progress.user_answers || {},
        score: progress.score || 0,
        questionsAnswered: progress.questions_answered || 0,
        isCompleted: progress.is_completed || false,
        timeRemaining
      };
    } catch (error) {
      console.error('Failed to resume quiz:', error);
      return null;
    }
  },

  /**
   * Submit an answer for a question
   */
  async submitAnswer(
    progressId: string, 
    questionId: string, 
    selectedOptions: string[],
    isLastQuestion: boolean = false
  ): Promise<{
    isCorrect: boolean;
    correctOptions: string[];
    newScore: number;
    questionsAnswered: number;
    isCompleted: boolean;
  } | null> {
    try {
      // Get the current progress
      const { data: progress, error: progressError } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('id', progressId)
        .single();
      
      if (progressError) {
        throw progressError;
      }
      
      if (!progress) {
        throw new Error('Quiz progress not found');
      }
      
      // Get the question to check correctness
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select(`
          *,
          options (*)
        `)
        .eq('id', questionId)
        .single();
      
      if (questionError) {
        throw questionError;
      }
      
      // Calculate if answer is correct
      const correctOptions = question.options.filter(opt => opt.is_correct).map(opt => opt.id);
      const isCorrect = 
        selectedOptions.length === correctOptions.length && 
        selectedOptions.every(id => correctOptions.includes(id));
      
      // Update user answers
      const userAnswers = {
        ...progress.user_answers,
        [questionId]: {
          selected_options: selectedOptions,
          is_correct: isCorrect
        }
      };
      
      // Update score and questions answered
      const newScore = isCorrect ? progress.score + 1 : progress.score;
      const newQuestionsAnswered = progress.questions_answered + 1;
      
      // Update the progress in the database
      await supabase
        .from('quiz_progress')
        .update({
          user_answers: userAnswers,
          score: newScore,
          questions_answered: newQuestionsAnswered,
          current_question: progress.current_question + 1,
          is_completed: isLastQuestion,
          updated_at: new Date().toISOString()
        })
        .eq('id', progressId);
      
      return {
        isCorrect,
        correctOptions,
        newScore,
        questionsAnswered: newQuestionsAnswered,
        isCompleted: isLastQuestion
      };
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return null;
    }
  },

  /**
   * Save quiz progress (for time remaining, etc.)
   */
  async saveQuizProgress(
    progressId: string, 
    currentQuestion: number, 
    userAnswers: Record<string, any>,
    score: number,
    questionsAnswered: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quiz_progress')
        .update({
          current_group: currentQuestion,  // Support both field names
          current_question: currentQuestion,
          user_answers: userAnswers,
          score: score,
          questions_answered: questionsAnswered,
          updated_at: new Date().toISOString()
        })
        .eq('id', progressId);
      
      if (error) {
        console.error('Error saving progress:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }
};

export interface Year {
    id: string;
    name: string;
    name_en?: string;
    name_fr?: string;
    description: string;
    description_en?: string;
    description_fr?: string;
    order_index: number;
    created_at: string;
  }
  
  export interface Subject {
    id: string;
    year_id: string;
    name: string;
    name_en?: string;
    name_fr?: string;
    description: string;
    description_en?: string;
    description_fr?: string;
    order_index: number;
    created_at: string;
  }
  
  export interface Course {
    id: string;
    subject_id: string;
    title: string;
    title_en?: string;
    title_fr?: string;
    description: string;
    description_en?: string;
    description_fr?: string;
    question_count: number;
    is_free: boolean;
    image?: string;
    category?: string;
    created_at: string;
  }
  
  export interface Question {
    id: string;
    course_id: string;
    text: string;
    text_en?: string;
    text_fr?: string;
    explanation?: string;
    explanation_en?: string;
    explanation_fr?: string;
    created_at: string;
    options?: Option[];
  }
  
  export interface Option {
    id: string;
    question_id: string;
    text: string;
    text_en?: string;
    text_fr?: string;
    is_correct: boolean;
    created_at: string;
  }
  
  export interface UserProgress {
    id: string;
    user_id: string;
    course_id: string;
    questions_attempted: number;
    questions_correct: number;
    last_attempt?: string;
    created_at: string;
  }
  
  export interface QuizProgress {
    id: string;
    user_id: string;
    course_id: string;
    current_question: number;
    user_answers: {[key: string]: string[]};
    score: number;
    questions_answered: number;
    wrong_answers: string[];
    is_completed: boolean;
    final_grade?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
    updated_at: string;
    is_admin: boolean;
  }
  
  export interface Subscription {
    id: string;
    user_id: string;
    duration: '1_month' | '2_months' | '3_months' | '6_months' | '9_months';
    price_tnd: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    clicktopay_transaction_id?: string;
    created_at: string;
  }
  
  export interface DeviceSession {
    id: string;
    user_id: string;
    device_fingerprint: string;
    last_active: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface QuizSettings {
    showAnswersImmediately: boolean;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  }
  
  export interface QuestionReport {
    id: string;
    question_id: string;
    user_id: string;
    reason: 'mal_posed' | 'repetitive' | 'incorrect' | 'other';
    description?: string;
    created_at: string;
  }
  
  export interface CourseSection {
    id: string;
    course_id: string;
    title_en: string;
    title_fr: string;
    description_en?: string;
    description_fr?: string;
    content_en?: string;
    content_fr?: string;
    order_index: number;
    created_at: string;
  }
  
  export type Theme = 'purple' | 'blue' | 'caramel' | 'pinky' | 'lollipop' | 'aesthetic';
  export type Language = 'fr' | 'en';
  
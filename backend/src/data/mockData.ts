
import { Course, Question, UserProgress } from "@/types";

export const mockCourses: Course[] = [
  {
    id: "course1",
    title: "Introduction to Computer Science",
    description: "Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.",
    category: "Computer Science",
    question_count: 25,
    image: "/placeholder.svg",
    subject_id: "cs1",
    created_at: new Date().toISOString(),
    title_en: "Introduction to Computer Science",
    title_fr: "Introduction à l'informatique",
    description_en: "Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.",
    description_fr: "Apprenez les fondamentaux de l'informatique incluant les algorithmes, structures de données et concepts de programmation.",
    is_free: true
  },
  {
    id: "course2",
    title: "Calculus I",
    description: "Master the basics of differential and integral calculus, including limits, derivatives, and integrals.",
    category: "Mathematics",
    question_count: 30,
    image: "/placeholder.svg",
    subject_id: "math1",
    created_at: new Date().toISOString(),
    title_en: "Calculus I",
    title_fr: "Calcul I",
    description_en: "Master the basics of differential and integral calculus, including limits, derivatives, and integrals.",
    description_fr: "Maîtrisez les bases du calcul différentiel et intégral, incluant les limites, dérivées et intégrales.",
    is_free: false
  },
  {
    id: "course3",
    title: "Psychology 101",
    description: "Explore the fundamentals of psychology, from cognitive development to social behavior.",
    category: "Psychology",
    question_count: 20,
    image: "/placeholder.svg",
    subject_id: "psych1",
    created_at: new Date().toISOString(),
    title_en: "Psychology 101",
    title_fr: "Psychologie 101",
    description_en: "Explore the fundamentals of psychology, from cognitive development to social behavior.",
    description_fr: "Explorez les fondamentaux de la psychologie, du développement cognitif au comportement social.",
    is_free: false
  },
  {
    id: "course4",
    title: "Organic Chemistry",
    description: "Study the properties and reactions of organic compounds and their applications in everyday life.",
    category: "Chemistry",
    question_count: 35,
    image: "/placeholder.svg",
    subject_id: "chem1",
    created_at: new Date().toISOString(),
    title_en: "Organic Chemistry",
    title_fr: "Chimie organique",
    description_en: "Study the properties and reactions of organic compounds and their applications in everyday life.",
    description_fr: "Étudiez les propriétés et réactions des composés organiques et leurs applications dans la vie quotidienne.",
    is_free: false
  }
];

export const mockQuestions: Question[] = [
  {
    id: "q1",
    course_id: "course1",
    text: "What does CPU stand for?",
    text_en: "What does CPU stand for?",
    text_fr: "Que signifie CPU ?",
    explanation: "CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing.",
    explanation_en: "CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing.",
    explanation_fr: "CPU signifie Central Processing Unit (Unité centrale de traitement), qui est le composant principal d'un ordinateur qui effectue la plupart des traitements.",
    created_at: new Date().toISOString()
  },
  {
    id: "q2",
    course_id: "course1",
    text: "Which of the following is NOT a programming paradigm?",
    text_en: "Which of the following is NOT a programming paradigm?",
    text_fr: "Lequel des suivants N'EST PAS un paradigme de programmation ?",
    explanation: "Differential is not a programming paradigm. The main programming paradigms include Object-Oriented, Functional, Declarative, Imperative, and Procedural.",
    explanation_en: "Differential is not a programming paradigm. The main programming paradigms include Object-Oriented, Functional, Declarative, Imperative, and Procedural.",
    explanation_fr: "Différentiel n'est pas un paradigme de programmation. Les principaux paradigmes incluent l'Orienté Objet, Fonctionnel, Déclaratif, Impératif et Procédural.",
    created_at: new Date().toISOString()
  }
];

export const mockUserProgress: UserProgress[] = [
  {
    course_id: "course1",
    questions_attempted: 15,
    questions_correct: 12,
    user_id: "user1",
    id: "progress1",
    created_at: new Date().toISOString(),
    last_attempt: new Date().toISOString()
  },
  {
    course_id: "course2",
    questions_attempted: 8,
    questions_correct: 5,
    user_id: "user1",
    id: "progress2",
    created_at: new Date().toISOString(),
    last_attempt: new Date().toISOString()
  }
];

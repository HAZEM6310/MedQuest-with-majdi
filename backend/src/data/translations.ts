// Fixed translations object with duplicate keys removed and structure normalized

export const translations = {
  en: {
    nav: {
      home: 'Home',
      courses: 'Courses',
      quiz: 'Quiz',
      profile: 'Profile',
      admin: 'Admin',
      progress: 'Progress',
      achievements: 'Achievements',
      subscription: 'Subscription',
      logout: 'Logout',
      login: 'Login',
      faculties: "Faculties",
      signup: 'Sign Up'
    },
    ui: {
      back: 'Back',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      update: 'Update',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      clear: 'Clear',
      select: 'Select',
      choose: 'Choose',
      upload: 'Upload',
      download: 'Download',
      preview: 'Preview',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      register: 'Register',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      changePassword: 'Change Password',
      profile: 'Profile',
      account: 'Account',
      dashboard: 'Dashboard',
      explore: 'Explore',
      all: 'All'
    },
    faculty: {
      browse: "Browse by Faculty",
      filteredSubjects: "Subjects in this Faculty",
      noSubjectsFound: "No subjects found for this faculty",
      select: "Select Faculty",
      viewAll: "View All Subjects",
      exploreFaculty: "Explore Faculty",
      all: "All Faculties",
      filtered: "Filtered by faculty"
    },
    home: {
      title: 'MedQuest',
      welcome: 'Master medical knowledge with interactive quizzes and comprehensive courses',
      subtitle: 'Your comprehensive medical education platform for mastering clinical knowledge',
      noContent: 'No academic years available',
      checkBack: 'Please check back later for new content'
    },
    course: {
      loading: 'Loading course...',
      notFound: 'Course not found',
      backHome: 'Back to Home',
      questions: 'questions',
      noQuestions: 'No courses available',
      noContent: 'No courses available',
      checkLater: 'Please check back later for new content',
      about: 'About this course',
      aboutDescription: 'This course contains {count} questions to test your knowledge',
      sampleQuestions: 'Sample Questions',
      previewQuestions: 'Preview some questions from this course',
      correct: 'Correct',
      moreOptions: '... and more options',
      noSampleQuestions: 'No sample questions available',
      totalCourses: 'Total Courses',
      freeCourses: 'Free Courses',
      start: 'Start',
      discover: 'Discover our complete medical courses with interactive quizzes',
      noCoursesFound: 'No courses found',
      tryOtherKeywords: 'Try with other keywords',
      totalQuestions: 'questions'
    },
    quiz: {
      loading: 'Loading quiz...',
      question: 'Question',
      of: 'of',
      score: 'Score',
       progress: "Progress",
       validateAnswer: "Validate Answer",
      nextQuestion: "Next Question",
      exitQuiz: "Exit Quiz?",
      exitWarning: "Your progress will be saved. You can continue this quiz later.",
      exitConfirm: "Exit Quiz",
      finishQuiz: 'Finish Quiz',
      explanation: 'Explanation',
      noQuestions: 'No questions available for this course',
      completed: 'Quiz completed! Final grade',
      incompleteQuizzes: 'Resume Your Quizzes',
      continue: 'Continue',
      startQuiz: 'Start Quiz',
      showFrench: 'Show French',
      showEnglish: 'Show English',
      showOriginal: 'Show Original',
      continueOrRestart: 'Continue Quiz or Start Over?',
      continueQuiz: 'Continue where you left off',
      startOver: 'Start over from the beginning',
      reviewQuestions: 'Review Questions',
      yourAnswer: 'Your Answer',
      correctAnswer: 'Correct Answer',
      settings: {
        title: 'Quiz Settings',
        showAnswers: 'Show answers immediately',
        showAnswersDesc: 'Display correct answers right after each question',
        start: 'Start Quiz'
      },
      results: {
        title: 'Quiz Results',
        generalAverage: 'General Average',
        timePerQuestion: 'Time per Question',
        success: 'Success',
        responses: 'responses',
        incomplete: 'Incomplete',
        wrong: 'Wrong',
        viewQuestions: 'View Questions',
        startOver: 'Start Over',
        retryWrong: 'Retry Wrong Questions',
        quit: 'Quit'
      }
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      welcomeBack: 'Welcome back',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      voucherCode: 'Voucher Code',
      voucherDescription: 'Optional: Enter a voucher code to earn credits from successful payments',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signInHere: 'Sign in here',
      signUpHere: 'Sign up here',
      signingIn: 'Signing in...',
      signingUp: 'Signing up...',
      resetPassword: 'Reset Password',
      sendResetEmail: 'Send Reset Email',
      backToSignIn: 'Back to Sign In',
      checkEmail: 'Check your email for reset instructions',
      continueWithGoogle: 'Continue with Google'
    },
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      updateProfile: 'Update Profile',
      profileUpdated: 'Profile updated successfully',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      settingsUpdated: 'Settings updated successfully',
      loginRequired: 'Login Required',
      loginRequiredDesc: 'Please log in to view your profile'
    },
    progress: {
      title: 'Progress',
      subtitle: 'Track your performance and improve your knowledge',
      loginRequired: 'Login Required',
      loginRequiredDesc: 'Please log in to view your progress',
      averageAccuracy: 'Average Accuracy',
      questionsAttempted: 'Questions Attempted',
      correctAnswers: 'Correct Answers',
      completedQuizzes: 'Completed Quizzes',
      performanceChart: 'Performance by Course',
      recentActivity: 'Recent Quiz Activity',
      accuracyDistribution: 'Accuracy Distribution',
      correct: 'Correct',
      incorrect: 'Incorrect',
      noProgress: 'No Progress Yet',
      noProgressDesc: 'Start taking quizzes to see your progress here',
      grade: 'Grade',
      completedOn: 'Completed on'
    },
    achievements: {
      title: 'Achievements',
      subtitle: 'Unlock badges and track your learning milestones',
      loginRequired: 'Login Required',
      loginRequiredDesc: 'Please log in to view your achievements',
      firstSteps: 'First Steps',
      firstStepsDesc: 'Complete your first quiz',
      perfectScore: 'Perfect Score',
      perfectScoreDesc: 'Get 100% on any quiz',
      speedRunner: 'Speed Runner',
      speedRunnerDesc: 'Complete 5 quizzes in one day',
      scholar: 'Scholar',
      scholarDesc: 'Complete 50 questions',
      master: 'Master',
      masterDesc: 'Complete 10 quizzes with 80%+ score',
      dedication: 'Dedication',
      dedicationDesc: 'Study for 7 consecutive days',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      noAchievements: 'No Achievements Yet',
      noAchievementsDesc: 'Start taking quizzes to unlock achievements'
    },
    subscription: {
      title: 'Subscription',
      required: 'Subscription Required',
      description: 'You need an active subscription to access this content',
      view: 'View Subscription Plans',
      plans: 'Subscription Plans',
      current: 'Current Plan',
      expires: 'Expires',
      renew: 'Renew',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      expired: 'Expired'
    },
    device: {
      unauthorized: 'Device Not Authorized',
      description: 'This device is not authorized to access the application',
      contact: 'Please contact support to authorize your device',
      backToLogin: 'Back to Login'
    },
    admin: {
      title: 'Administration',
      dashboard: 'Dashboard',
      users: 'Users',
      courses: 'Courses',
      questions: 'Questions',
      reports: 'Reports',
      settings: 'Settings',
      addUser: 'Add User',
      addCourse: 'Add Course',
      addQuestion: 'Add Question',
      addYear: 'Add Year',
      addSubject: 'Add Subject',
      editUser: 'Edit User',
      editCourse: 'Edit Course',
      editQuestion: 'Edit Question',
      deleteUser: 'Delete User',
      deleteCourse: 'Delete Course',
      deleteQuestion: 'Delete Question',
      userAdded: 'User added successfully',
      courseAdded: 'Course added successfully',
      questionAdded: 'Question added successfully',
      userUpdated: 'User updated successfully',
      courseUpdated: 'Course updated successfully',
      questionUpdated: 'Question updated successfully',
      userDeleted: 'User deleted successfully',
      courseDeleted: 'Course deleted successfully',
      questionDeleted: 'Question deleted successfully',
      manageContent: 'Manage Content',
      editContent: 'Edit Content'
    },
    themes: {
      purple: 'Purple',
      blue: 'Blue',
      caramel: 'Caramel',
      pinky: 'Pinky',
      lollipop: 'Lollipop',
      aesthetic: 'Aesthetic'
    },
    languages: {
      en: 'English',
      fr: 'Français'
    },
    landing: {
      nav: {
        home: 'Home',
        features: 'Features',
        pricing: 'Pricing',
        login: 'Login',
        register: 'Register'
      },
      hero: {
        title: 'Master Your Courses with Confidence',
        subtitle: 'Access thousands of quizzes, summaries, and clinical cases in one place. Designed for medical students and academic excellence.',
        cta: 'Get Started'
      },
      features: {
        title: 'Revolutionary Platform Features',
        subtitle: 'The first bilingual medical education platform designed for global medical students',
        qcm: {
          title: 'QCM Database',
          description: 'Thousands of multiple-choice questions for every medical subject and year.'
        },
        summaries: {
          title: 'Course Summaries',
          description: 'Concise, high-yield summaries for rapid revision and exam prep.'
        },
        bilingual: {
          title: 'English & French',
          description: 'The first medical learning platform available in both English and French languages.',
          badge: 'FIRST EVER'
        },
        cases: {
          title: 'Clinical Cases',
          description: 'Practice with real-world clinical scenarios and case studies.'
        }
      },
      pricing: {
        title: 'Choose the plan that suits you',
        subtitle: 'Slide the handle to choose the number of months',
        months: 'MONTHS',
        period: 'Subscription period',
        monthlyPrice: 'Monthly Price',
        savings: 'Savings',
        cta: 'I choose this offer'
      },
      additionalFeatures: {
        title: 'Even more advantages',
        smartGrading: {
          title: 'Intelligent grading system',
          description: 'Identical to official exams, you will get scores that truly reflect your academic level.'
        },
        detailedExplanations: {
          title: 'Detailed explanations',
          description: 'Written by experienced professors and validated by medical field experts.'
        },
        totalAccessibility: {
          title: 'Total accessibility',
          description: 'Wherever you are, all content will be accessible on computer, tablet and mobile.'
        },
        modernInterface: {
          title: 'Modern interface',
          description: 'Intuitive platform with advanced features optimized for your learning experience.'
        },
        regularUpdates: {
          title: 'Regular updates',
          description: 'Content and exams are continuously updated according to the latest academic programs.'
        },
        securePayment: {
          title: 'Secure payment',
          description: 'Protected transactions via our platform with bank cards and electronic wallets. Immediate access after payment.'
        }
      },
      demo: {
        title: 'See the Platform in Action',
        description: 'Explore our intuitive dashboard, track your progress, and access quizzes and summaries tailored for medical students.'
      },
      cta: {
        title: 'Join hundreds of students improving their learning daily.',
        button: 'Try it free'
      },
      footer: {
        about: 'About',
        terms: 'Terms',
        privacy: 'Privacy',
        contact: 'Contact',
        copyright: '© 2025 MedQuest. All rights reserved.'
      }
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      courses: 'Cours',
      quiz: 'Quiz',
      profile: 'Profil',
      admin: 'Administration',
      progress: 'Progrès',
      achievements: 'Réussites',
      subscription: 'Abonnement',
      logout: 'Déconnexion',
      login: 'Connexion',
      signup: 'Inscription',
      faculties: "Facultés"
    },
    ui: {
      back: 'Retour',
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      update: 'Mettre à jour',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      yes: 'Oui',
      no: 'Non',
      confirm: 'Confirmer',
      close: 'Fermer',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      reset: 'Réinitialiser',
      clear: 'Effacer',
      select: 'Sélectionner',
      choose: 'Choisir',
      upload: 'Télécharger',
      download: 'Télécharger',
      preview: 'Aperçu',
      settings: 'Paramètres',
      help: 'Aide',
      about: 'À propos',
      contact: 'Contact',
      register: 'Inscription',
      forgotPassword: 'Mot de passe oublié',
      resetPassword: 'Réinitialiser le mot de passe',
      changePassword: 'Changer le mot de passe',
      profile: 'Profil',
      account: 'Compte',
      dashboard: 'Tableau de bord',
      explore: 'Explorer',
      all: 'Tous'
    },
    faculty: {
      browse: "Parcourir par Faculté",
      select: "Sélectionner une Faculté",
      filteredSubjects: "Matières dans cette Faculté",
      noSubjectsFound: "Aucune matière trouvée pour cette faculté",
      viewAll: "Voir toutes les matières",
      exploreFaculty: "Explorer la Faculté",
      all: "Toutes les facultés",
      filtered: "Filtré par faculté"
    },
    home: {
      title: 'MedQuest',
      welcome: 'Maîtrisez les connaissances médicales avec des quiz interactifs et des cours complets',
      subtitle: 'Votre plateforme d\'éducation médicale complète pour maîtriser les connaissances cliniques',
      noContent: 'Aucune année académique disponible',
      checkBack: 'Veuillez revenir plus tard pour du nouveau contenu'
    },
    course: {
      loading: 'Chargement du cours...',
      notFound: 'Cours non trouvé',
      backHome: 'Retour à l\'accueil',
      questions: 'questions',
      noQuestions: 'Aucun cours disponible',
      noContent: 'Aucun cours disponible',
      checkLater: 'Veuillez revenir plus tard pour du nouveau contenu',
      about: 'À propos de ce cours',
      aboutDescription: 'Ce cours contient {count} questions pour tester vos connaissances',
      sampleQuestions: 'Questions d\'exemple',
      previewQuestions: 'Aperçu de quelques questions de ce cours',
      correct: 'Correct',
      moreOptions: '... et plus d\'options',
      noSampleQuestions: 'Aucune question d\'exemple disponible',
      totalCourses: 'Total Cours',
      freeCourses: 'Cours Gratuits',
      start: 'Commencer',
      discover: 'Découvrez nos cours médicaux complets avec des quiz interactifs',
      noCoursesFound: 'Aucun cours trouvé',
      tryOtherKeywords: 'Essayez avec d\'autres mots-clés'
    },
    quiz: {
      loading: 'Chargement du quiz...',
      question: 'Question',
      of: 'sur',
      score: 'Score',
      progress: "Progrès",
      validateAnswer: "Valider la réponse",
      nextQuestion: "Question suivante",
      exitQuiz: "Quitter le quiz ?",
      exitWarning: "Votre progression sera sauvegardée. Vous pourrez continuer ce quiz plus tard.",
      exitConfirm: "Quitter",
      finishQuiz: 'Terminer le quiz',
    
      explanation: 'Explication',
      noQuestions: 'Aucune question disponible pour ce cours',
      completed: 'Quiz terminé ! Note finale',
      incompleteQuizzes: 'Reprendre vos Quiz',
      continue: 'Continuer',
      startQuiz: 'Commencer le Quiz',
      showFrench: 'Afficher en français',
      showEnglish: 'Afficher en anglais',
      showOriginal: 'Afficher l\'original',
      continueOrRestart: 'Continuer ou Recommencer ?',
      continueQuiz: 'Continuer où vous vous êtes arrêté',
      startOver: 'Recommencer depuis le début',
      reviewQuestions: 'Réviser les Questions',
      yourAnswer: 'Votre Réponse',
      correctAnswer: 'Réponse Correcte',
      settings: {
        title: 'Paramètres du Quiz',
        showAnswers: 'Afficher les réponses immédiatement',
        showAnswersDesc: 'Afficher les bonnes réponses juste après chaque question',
        start: 'Commencer le Quiz'
      },
      results: {
        title: 'Résultats du Quiz',
        generalAverage: 'Moyenne générale',
        timePerQuestion: 'Temps par question',
        success: 'Réussi',
        responses: 'réponses',
        incomplete: 'Incomplète',
        wrong: 'Fausse',
        viewQuestions: 'Voir les questions',
        startOver: 'Recommencer à zéro',
        retryWrong: 'Refaire les questions ratées',
        quit: 'Quitter'
      }
    },
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      welcomeBack: 'Bon retour',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      fullName: 'Nom complet',
      voucherCode: 'Code de bon',
      voucherDescription: 'Optionnel: Entrez un code de bon pour gagner des crédits sur les paiements réussis',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas de compte ?',
      hasAccount: 'Déjà un compte ?',
      signInHere: 'Connectez-vous ici',
      signUpHere: 'Inscrivez-vous ici',
      signingIn: 'Connexion...',
      signingUp: 'Inscription...',
      resetPassword: 'Réinitialiser le mot de passe',
      sendResetEmail: 'Envoyer l\'email de réinitialisation',
      backToSignIn: 'Retour à la connexion',
      checkEmail: 'Vérifiez votre email pour les instructions de réinitialisation',
      continueWithGoogle: 'Continuer avec Google'
    },
    profile: {
      title: 'Profil',
      personalInfo: 'Informations personnelles',
      updateProfile: 'Mettre à jour le profil',
      profileUpdated: 'Profil mis à jour avec succès',
      settings: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      settingsUpdated: 'Paramètres mis à jour avec succès',
      loginRequired: 'Connexion requise',
      loginRequiredDesc: 'Veuillez vous connecter pour voir votre profil'
    },
    progress: {
      title: 'Progrès',
      subtitle: 'Suivez vos performances et améliorez vos connaissances',
      loginRequired: 'Connexion requise',
      loginRequiredDesc: 'Connectez-vous pour voir vos progrès',
      averageAccuracy: 'Précision Moyenne',
      questionsAttempted: 'Questions Tentées',
      correctAnswers: 'Réponses Correctes',
      completedQuizzes: 'Quiz Terminés',
      performanceChart: 'Performance par Cours',
      recentActivity: 'Activité Récente des Quiz',
      accuracyDistribution: 'Distribution de la Précision',
      correct: 'Correct',
      incorrect: 'Incorrect',
      noProgress: 'Aucun Progrès Encore',
      noProgressDesc: 'Commencez à faire des quiz pour voir vos progrès ici',
      grade: 'Note',
      completedOn: 'Terminé le'
    },
    achievements: {
      title: 'Réussites',
      subtitle: 'Débloquez des badges et suivez vos étapes d\'apprentissage',
      loginRequired: 'Connexion requise',
      loginRequiredDesc: 'Connectez-vous pour voir vos réussites',
      firstSteps: 'Premiers Pas',
      firstStepsDesc: 'Terminez votre premier quiz',
      perfectScore: 'Score Parfait',
      perfectScoreDesc: 'Obtenez 100% à n\'importe quel quiz',
      speedRunner: 'Coureur Rapide',
      speedRunnerDesc: 'Terminez 5 quiz en une journée',
      scholar: 'Érudit',
      scholarDesc: 'Terminez 50 questions',
      master: 'Maître',
      masterDesc: 'Terminez 10 quiz avec un score de 80%+',
      dedication: 'Dévouement',
      dedicationDesc: 'Étudiez pendant 7 jours consécutifs',
      unlocked: 'Débloqué',
      locked: 'Verrouillé',
      progress: 'Progrès',
      noAchievements: 'Aucune Réussite Encore',
      noAchievementsDesc: 'Commencez à faire des quiz pour débloquer des réussites'
    },
    subscription: {
      title: 'Abonnement',
      required: 'Abonnement requis',
      description: 'Vous avez besoin d\'un abonnement actif pour accéder à ce contenu',
      view: 'Voir les plans d\'abonnement',
      plans: 'Plans d\'abonnement',
      current: 'Plan actuel',
      expires: 'Expire',
      renew: 'Renouveler',
      upgrade: 'Améliorer',
      downgrade: 'Rétrograder',
      cancel: 'Annuler',
      active: 'Actif',
      inactive: 'Inactif',
      expired: 'Expiré'
    },
    device: {
      unauthorized: 'Appareil non autorisé',
      description: 'Cet appareil n\'est pas autorisé à accéder à l\'application',
      contact: 'Veuillez contacter le support pour autoriser votre appareil',
      backToLogin: 'Retour à la connexion'
    },
    admin: {
      title: 'Administration',
      dashboard: 'Tableau de bord',
      users: 'Utilisateurs',
      courses: 'Cours',
      questions: 'Questions',
      reports: 'Rapports',
      settings: 'Paramètres',
      addUser: 'Ajouter un utilisateur',
      addCourse: 'Ajouter un cours',
      addQuestion: 'Ajouter une question',
      addYear: 'Ajouter une année',
      addSubject: 'Ajouter une matière',
      editUser: 'Modifier l\'utilisateur',
      editCourse: 'Modifier le cours',
      editQuestion: 'Modifier la question',
      deleteUser: 'Supprimer l\'utilisateur',
      deleteCourse: 'Supprimer le cours',
      deleteQuestion: 'Supprimer la question',
      userAdded: 'Utilisateur ajouté avec succès',
      courseAdded: 'Cours ajouté avec succès',
      questionAdded: 'Question ajoutée avec succès',
      userUpdated: 'Utilisateur mis à jour avec succès',
      courseUpdated: 'Cours mis à jour avec succès',
      questionUpdated: 'Question mise à jour avec succès',
      userDeleted: 'Utilisateur supprimé avec succès',
      courseDeleted: 'Cours supprimé avec succès',
      questionDeleted: 'Question supprimée avec succès',
      manageContent: 'Gérer le contenu',
      editContent: 'Modifier le contenu'
    },
    themes: {
      purple: 'Violet',
      blue: 'Bleu',
      caramel: 'Caramel',
      pinky: 'Rose',
      lollipop: 'Sucette',
      aesthetic: 'Esthétique'
    },
    languages: {
      en: 'English',
      fr: 'Français'
    },
    landing: {
      nav: {
        home: 'Accueil',
        features: 'Fonctionnalités',
        pricing: 'Tarifs',
        login: 'Connexion',
        register: 'Inscription'
      },
      hero: {
        title: 'Maîtrisez vos cours en toute confiance',
        subtitle: 'Accédez à des milliers de quiz, résumés et cas cliniques en un seul endroit. Conçu pour les étudiants en médecine et l\'excellence académique.',
        cta: 'Commencer'
      },
      features: {
        title: 'Fonctionnalités révolutionnaires de la plateforme',
        subtitle: 'La première plateforme d\'éducation médicale bilingue conçue pour les étudiants en médecine du monde entier',
        qcm: {
          title: 'Base de données QCM',
          description: 'Des milliers de questions à choix multiples pour chaque matière médicale et année.'
        },
        summaries: {
          title: 'Résumés de cours',
          description: 'Résumés concis et à haut rendement pour une révision rapide et la préparation aux examens.'
        },
        bilingual: {
          title: 'Anglais et Français',
          description: 'La première plateforme d\'apprentissage médical disponible en anglais et en français.',
          badge: 'PREMIÈRE FOIS'
        },
        cases: {
          title: 'Cas cliniques',
          description: 'Pratiquez avec des scenarios cliniques réels et des études de cas.'
        }
      },
      pricing: {
        title: 'Choisissez l\'offre qui vous convient',
        subtitle: 'Glissez la manette pour choisir le nombre de mois',
        months: 'MOIS',
        period: 'Période de l\'abonnement',
        monthlyPrice: 'Prix Mensuel',
        savings: 'Économies',
        cta: 'Je choisis cette offre'
      },
      additionalFeatures: {
        title: 'Encore d\'autres avantages',
        smartGrading: {
          title: 'Système de notation intelligent',
          description: 'Identique aux examens officiels, vous obtiendrez des scores qui reflètent fidèlement votre niveau académique.'
        },
        detailedExplanations: {
          title: 'Explications détaillées',
          description: 'Rédigées par des professeurs expérimentés et validées par des experts du domaine médical.'
        },
        totalAccessibility: {
          title: 'Accessibilité totale',
          description: 'Où que vous soyez, tout le contenu vous sera accessible sur ordinateur, tablette et mobile.'
        },
        modernInterface: {
          title: 'Interface moderne',
          description: 'Plateforme intuitive avec des fonctionnalités avancées optimisées pour votre expérience d\'apprentissage.'
        },
        regularUpdates: {
          title: 'Mises à jour régulières',
          description: 'Le contenu et les examens sont mis à jour en continu selon les derniers programmes académiques.'
        },
        securePayment: {
          title: 'Paiement sécurisé',
          description: 'Transactions protégées via notre plateforme avec cartes bancaires et portefeuilles électroniques. Accès immédiat après paiement.'
        }
      },
      demo: {
        title: 'Voyez la plateforme en action',
        description: 'Explorez notre tableau de bord intuitif, suivez vos progrès et accédez aux quiz et résumés adaptés aux étudiants en médecine.'
      },
      cta: {
        title: 'Rejoignez des centaines d\'étudiants qui améliorent leur apprentissage quotidiennement.',
        button: 'Essayez gratuitement'
      },
      footer: {
        about: 'À propos',
        terms: 'Conditions',
        privacy: 'Confidentialité',
        contact: 'Contact',
        copyright: '© 2025 MedQuest. Tous droits réservés.'
      }
    }
  }
};
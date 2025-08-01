import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, BookmarkIcon, XCircle, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import QcmQuestion from "./QcmQuestion";
import { motion } from "framer-motion"; // Import motion separately

interface QcmBodyProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedOptions: string[];
  userAnswers: { [key: string]: string[] };
  answeredQuestions: Set<number>;
  correctQuestions: Set<number>;
  partiallyCorrectQuestions: Set<number>;
  bookmarkedQuestions: Set<number>;
  showResult: boolean;
  isCorrect: boolean;
  timer: number;
  isPaused: boolean;
  isRetryMode?: boolean;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onFinish: () => void;
  onBookmark: () => void;
  onQuit: () => void;
  onPauseResume: () => void;
  onQuestionSelect: (index: number) => void;
}

export default function QcmBody({
  questions,
  currentQuestionIndex,
  selectedOptions,
  userAnswers,
  answeredQuestions,
  correctQuestions,
  partiallyCorrectQuestions,
  bookmarkedQuestions,
  showResult,
  isCorrect,
  timer,
  isPaused,
  isRetryMode = false,
  onOptionSelect,
  onNext,
  onPrevious,
  onSubmit,
  onFinish,
  onBookmark,
  onQuit,
  onPauseResume,
  onQuestionSelect,
}: QcmBodyProps) {
  const { t } = useLanguage();
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = isRetryMode ? false : answeredQuestions.has(currentQuestionIndex);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnyOptionSelected = selectedOptions.length > 0;

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Scroll to top when changing questions
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);

  // Get university/course info for display
  const getCourseSubject = () => {
    return "Medical Course";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Pause Overlay - simple version without AnimatePresence */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/10 p-8 rounded-2xl text-center backdrop-blur-md max-w-sm">
            <div className="w-32 h-32 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <Pause className="h-16 w-16 text-white" />
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-6">
              {t('quiz.paused') || 'Quiz Paused'}
            </h2>
            
            <Button 
              onClick={onPauseResume}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {t('quiz.resume') || 'Resume Quiz'}
            </Button>
          </div>
        </div>
      )}

      {/* Left Content Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-primary">{currentQuestion?.faculty?.name || "Quiz"}</h1>
            <p className="text-sm text-muted-foreground">{getCourseSubject()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary font-medium">{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">{formatTime(timer)}</span>
            </div>
            <button 
              onClick={onPauseResume}
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button 
              onClick={onBookmark}
              className={cn(
                "p-2 rounded-full",
                bookmarkedQuestions.has(currentQuestionIndex) 
                  ? "bg-primary text-white" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              aria-label="Bookmark"
            >
              <BookmarkIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setQuitDialogOpen(true)} 
              className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
              aria-label="Quit"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Question Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-5 bg-blue-50 rounded-xl">
            <p className="text-gray-800">{currentQuestion?.text}</p>
          </div>

          <QcmQuestion
            question={currentQuestion}
            selectedOptions={selectedOptions}
            onOptionSelect={onOptionSelect}
            showResult={isRetryMode ? false : showResult}
            isCorrect={isCorrect}
            isPartiallyCorrect={partiallyCorrectQuestions.has(currentQuestionIndex)}
            isRetryMode={isRetryMode} 
          />
        </div>

        {/* Footer Controls */}
        <div className="bg-white border-t p-4 flex justify-between items-center">
          <div>
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={onPrevious}
                className="px-6"
              >
                {t('ui.previous')}
              </Button>
            )}
          </div>
          <div>
            {(!isAnswered || isRetryMode) ? (
              <Button
                onClick={onSubmit}
                disabled={!isAnyOptionSelected}
                className={cn(
                  "px-6",
                  isAnyOptionSelected ? "bg-primary" : "bg-primary/50"
                )}
              >
                {t('quiz.validateAnswer')}
              </Button>
            ) : (
              <Button
                onClick={isLastQuestion ? onFinish : onNext}
                className="px-6 bg-primary"
              >
                {isLastQuestion ? t('quiz.finishQuiz') : t('quiz.nextQuestion')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Question Navigation */}
      <div className="w-72 bg-white border-l hidden md:flex md:flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg text-center">{t('quiz.progress')}</h2>
        </div>
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
                  onClick={() => onQuestionSelect(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quit Dialog */}
      <Dialog open={quitDialogOpen} onOpenChange={setQuitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('quiz.exitQuiz')}</DialogTitle>
            <DialogDescription>
              {t('quiz.exitWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setQuitDialogOpen(false)}>
              {t('ui.cancel')}
            </Button>
            <Button variant="destructive" onClick={onQuit}>
              {t('quiz.exitConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
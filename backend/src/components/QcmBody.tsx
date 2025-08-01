import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, BookmarkIcon, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import QcmQuestion from "./QcmQuestion";

interface QcmBodyProps {
  questions: Question[];
  correctQuestions: Set<number>;
  currentQuestionIndex: number;
  selectedOptions: string[];
  userAnswers: { [key: string]: string[] };
  answeredQuestions: Set<number>;
  bookmarkedQuestions: Set<number>;
  showResult: boolean;
  isCorrect: boolean;
  timer: number;
  isPaused: boolean;
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
  bookmarkedQuestions,
  showResult,
  isCorrect,
  timer,
  isPaused,
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
  const isAnswered = answeredQuestions.has(currentQuestionIndex);
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

  const getCourseSubject = () => {
    // Replace with actual data from your course
    return "Cardio-CCV / D.T.A";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Content Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-primary">{currentQuestion?.text_en}</h1>
            <p className="text-sm text-muted-foreground">{getCourseSubject()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-primary/10 px-4 py-1 rounded-full">
              <span className="text-primary font-medium">{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-1 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">{formatTime(timer)}</span>
            </div>
            <button 
              onClick={onBookmark}
              className={cn(
                "p-2 rounded-full",
                bookmarkedQuestions.has(currentQuestionIndex) 
                  ? "bg-primary text-white" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setQuitDialogOpen(true)} 
              className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
            >
              <XCircle className="h-5 w-5" />
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
            showResult={showResult}
            isCorrect={isCorrect}
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
            {!isAnswered ? (
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
      <div className="w-64 bg-white border-l hidden md:flex md:flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg text-center">{t('quiz.progress')}</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => {
              const isAnsweredQuestion = answeredQuestions.has(index);
              const isCurrent = currentQuestionIndex === index;
              const isBookmarked = bookmarkedQuestions.has(index);
              
              return (
                <button
                  key={index}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full font-medium text-sm",
                    isCurrent && "ring-2 ring-primary",
                    isAnsweredQuestion && "bg-green-100 text-green-700",
                    !isAnsweredQuestion && !isCurrent && "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    isBookmarked && "ring-2 ring-yellow-400"
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
            <DialogDescription>{t('quiz.exitWarning')}</DialogDescription>
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
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, BookmarkIcon, XCircle, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question, QuestionGroup } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import QcmQuestion from "./QcmQuestion";
import { motion } from "framer-motion";

interface QcmBodyProps {
  questions: Question[];
  questionGroups: QuestionGroup[];
  currentGroupIndex: number;
  selectedOptions: { [questionId: string]: string[] };
  userAnswers: { [key: string]: string[] };
  answeredGroups: Set<string>;
  correctQuestions: Set<string>;
  partiallyCorrectQuestions: Set<string>;
  bookmarkedGroups: Set<string>;
  showResult: boolean;
  timer: number;
  isPaused: boolean;
  isRetryMode?: boolean;
  showSidebar?: boolean;
  onOptionSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onFinish: () => void;
  onBookmark: () => void;
  onQuit: () => void;
  onPauseResume: () => void;
  onGroupSelect: (index: number) => void;
}

export default function QcmBody({
  questions,
  questionGroups,
  currentGroupIndex,
  selectedOptions,
  userAnswers,
  answeredGroups,
  correctQuestions,
  partiallyCorrectQuestions,
  bookmarkedGroups,
  showResult,
  timer,
  isPaused,
  isRetryMode = false,
  showSidebar = true,
  onOptionSelect,
  onNext,
  onPrevious,
  onSubmit,
  onFinish,
  onBookmark,
  onQuit,
  onPauseResume,
  onGroupSelect,
}: QcmBodyProps) {
  const { t } = useLanguage();
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const currentGroup = questionGroups[currentGroupIndex];
  const groupQuestions = questions.filter(q => q.group_id === currentGroup?.id)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  
  const isCurrentGroupAnswered = currentGroup && answeredGroups.has(currentGroup.id);
  const isLastGroup = currentGroupIndex === questionGroups.length - 1;
  
  // Check if all questions in group have at least one option selected
  const allQuestionsHaveSelection = groupQuestions.every(
    question => (selectedOptions[question.id] || []).length > 0
  );

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Scroll to top when changing groups
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentGroupIndex]);

  // Get university/course info for display
  const getCourseSubject = () => {
    return "Medical Course";
  };

  // Is question correct or partially correct
  const getQuestionStatus = (questionId: string) => {
    if (correctQuestions.has(questionId)) return 'correct';
    if (partiallyCorrectQuestions.has(questionId)) return 'partial';
    return 'incorrect';
  };

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      {/* Pause Overlay */}
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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-3 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-primary">{currentGroup?.title || "Quiz"}</h1>
            <p className="text-sm text-muted-foreground">{getCourseSubject()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary font-medium">{currentGroupIndex + 1}/{questionGroups.length}</span>
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
                currentGroup && bookmarkedGroups.has(currentGroup.id) 
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

        {/* Clinical Case Content - With bottom padding for fixed footer */}
        <div 
          ref={contentRef} 
          className="flex-1 overflow-y-auto p-4 pb-16"
        >
          {/* Case description */}
          {currentGroup?.description && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Case: {currentGroup.title}</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{currentGroup.description}</p>
            </div>
          )}

          {/* Multiple questions for this case */}
          <div className="space-y-8">
            {groupQuestions.map((question, idx) => (
              <div key={question.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <h4 className="font-medium mb-3">Question {idx + 1}: {question.text}</h4>
                <QcmQuestion
                  question={question}
                  selectedOptions={selectedOptions[question.id] || []}
                  onOptionSelect={(optionId) => onOptionSelect(question.id, optionId)}
                  showResult={isRetryMode ? false : (showResult && userAnswers[question.id])}
                  isCorrect={correctQuestions.has(question.id)}
                  isPartiallyCorrect={partiallyCorrectQuestions.has(question.id)}
                  isRetryMode={isRetryMode} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:left-0 md:right-auto md:w-[calc(100%-18rem)] bg-white border-t p-3 flex justify-between items-center z-20 shadow-md">
          <div>
            {currentGroupIndex > 0 && (
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
            {(!isCurrentGroupAnswered || isRetryMode) ? (
              <Button
                onClick={onSubmit}
                disabled={!allQuestionsHaveSelection}
                className={cn(
                  "px-6",
                  allQuestionsHaveSelection ? "bg-primary" : "bg-primary/50"
                )}
              >
                {t('quiz.validateAnswers')}
              </Button>
            ) : (
              <Button
                onClick={isLastGroup ? onFinish : onNext}
                className="px-6 bg-primary"
              >
                {isLastGroup ? t('quiz.finishQuiz') : t('quiz.nextCase')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="w-72 bg-white border-l hidden md:flex md:flex-col">
          <div className="p-3 border-b sticky top-0 z-10 bg-white">
            <h2 className="font-semibold text-lg text-center">{t('quiz.progress')}</h2>
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
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
                    onClick={() => onGroupSelect(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Bookmark, 
  BookmarkCheck,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Home
} from 'lucide-react';
import QcmQuestion from './QcmQuestion';
import QcmActions from './QcmActions';
import { Question, Option } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface QcmBodyProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedOptions: string[];
  userAnswers: {[key: string]: string[]};
  answeredQuestions: Set<number>;
  bookmarkedQuestions: Set<number>;
  showResult: boolean;
  isCorrect?: boolean;
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
  onQuestionSelect
}: QcmBodyProps) {
  const { t } = useLanguage();
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isBookmarked = bookmarkedQuestions.has(currentQuestionIndex);
  const isAnswered = answeredQuestions.has(currentQuestionIndex);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.round((answeredQuestions.size / questions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container max-w-4xl py-8 space-y-6">
        
        {/* Header */}
        <Card className="border-primary/20 shadow-lg bg-background/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              
              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {currentQuestionIndex + 1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {questions.length}
                  </p>
                </div>
                
                <div className="w-48 bg-secondary rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                
                <Badge variant="secondary" className="font-semibold">
                  {getProgressPercentage()}% Complete
                </Badge>
              </div>

              {/* Timer & Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                  <Timer className={cn(
                    "h-4 w-4",
                    isPaused ? "text-orange-500" : "text-green-500"
                  )} />
                  <span className="font-mono font-semibold">
                    {formatTime(timer)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPauseResume}
                  className="gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBookmark}
                  className={cn(
                    "gap-2",
                    isBookmarked && "text-yellow-600 border-yellow-300 bg-yellow-50"
                  )}
                >
                  {isBookmarked ? 
                    <BookmarkCheck className="h-4 w-4" /> : 
                    <Bookmark className="h-4 w-4" />
                  }
                  Bookmark
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onQuit}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Home className="h-4 w-4" />
                  Quit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation Bar */}
        <Card className="bg-background/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => {
                const isCurrentQuestion = index === currentQuestionIndex;
                const isQuestionAnswered = answeredQuestions.has(index);
                const isQuestionBookmarked = bookmarkedQuestions.has(index);
                
                return (
                  <Button
                    key={index}
                    variant={isCurrentQuestion ? "default" : "outline"}
                    size="sm"
                    onClick={() => onQuestionSelect(index)}
                    className={cn(
                      "relative min-w-[40px] h-10",
                      isQuestionAnswered && !isCurrentQuestion && "bg-green-100 text-green-700 border-green-300",
                      !isQuestionAnswered && !isCurrentQuestion && "border-orange-300 text-orange-600",
                      isQuestionBookmarked && "ring-2 ring-yellow-400"
                    )}
                  >
                    {index + 1}
                    {isQuestionAnswered && !isCurrentQuestion && (
                      <Check className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
                    )}
                    {isQuestionBookmarked && (
                      <Bookmark className="absolute -top-1 -left-1 h-3 w-3 fill-yellow-400 text-yellow-500" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Component */}
        <QcmQuestion
          question={currentQuestion}
          selectedOptions={selectedOptions}
          showResult={showResult}
          isCorrect={isCorrect}
          onOptionSelect={onOptionSelect}
          userAnswers={userAnswers[currentQuestion.id] || []}
        />

        {/* Actions Component */}
        <QcmActions
          onPrevious={onPrevious}
          onNext={onNext}
          onSubmit={onSubmit}
          onFinish={onFinish}
          canGoPrevious={!isFirstQuestion}
          canGoNext={isAnswered || showResult}
          isLastQuestion={isLastQuestion}
          showResult={showResult}
          hasSelectedOptions={selectedOptions.length > 0}
        />
      </div>
    </div>
  );
}
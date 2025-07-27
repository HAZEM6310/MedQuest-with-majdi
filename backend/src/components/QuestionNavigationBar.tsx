
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

interface QuestionNavigationBarProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  correctQuestions?: Set<number>;
  wrongQuestions?: Set<number>;
  showResults?: boolean;
  onQuestionSelect: (questionIndex: number) => void;
}

export default function QuestionNavigationBar({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  correctQuestions = new Set(),
  wrongQuestions = new Set(),
  showResults = false,
  onQuestionSelect
}: QuestionNavigationBarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 sticky bottom-0">
      <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNumber = index + 1;
          const isAnswered = answeredQuestions.has(index);
          const isCurrent = currentQuestion === index;
          const isCorrect = correctQuestions.has(index);
          const isWrong = wrongQuestions.has(index);

          let icon = <Circle className="h-4 w-4" />;
          let variant: "default" | "outline" | "secondary" | "destructive" | "ghost" = "outline";
          
          if (showResults) {
            if (isCorrect) {
              icon = <CheckCircle className="h-4 w-4" />;
              variant = "default";
            } else if (isWrong) {
              icon = <AlertCircle className="h-4 w-4" />;
              variant = "destructive";
            }
          } else if (isAnswered) {
            icon = <CheckCircle className="h-4 w-4" />;
            variant = "secondary";
          }

          if (isCurrent && !showResults) {
            variant = "default";
          }

          return (
            <Button
              key={index}
              variant={variant}
              size="sm"
              onClick={() => onQuestionSelect(index)}
              className={`w-10 h-10 p-0 ${isCurrent ? 'ring-2 ring-primary' : ''}`}
            >
              {icon}
              <span className="sr-only">Question {questionNumber}</span>
            </Button>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
        {!showResults ? (
          <>
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              <span>Not answered</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Answered</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span>Wrong</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

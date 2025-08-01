import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QcmQuestionProps {
  question: Question;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  showResult: boolean;
  isCorrect: boolean;
}

export default function QcmQuestion({
  question,
  selectedOptions,
  onOptionSelect,
  showResult,
  isCorrect
}: QcmQuestionProps) {
  if (!question || !question.options) return null;
  
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const getOptionStatus = (optionId: string) => {
    if (!showResult) return 'normal';
    
    const option = question.options?.find(opt => opt.id === optionId);
    const isSelected = selectedOptions.includes(optionId);
    
    if (option?.is_correct && isSelected) return 'correct';
    if (option?.is_correct && !isSelected) return 'missed';
    if (!option?.is_correct && isSelected) return 'wrong';
    
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {question.options.map((option, index) => {
        const isSelected = selectedOptions.includes(option.id);
        const optionStatus = getOptionStatus(option.id);
        
        return (
          <div
            key={option.id}
            className={cn(
              "border-2 rounded-xl overflow-hidden transition-all",
              isSelected && !showResult && "border-primary",
              !isSelected && !showResult && "border-gray-100 hover:border-gray-300",
              optionStatus === 'correct' && "border-green-500 bg-green-50",
              optionStatus === 'wrong' && "border-red-500 bg-red-50",
              optionStatus === 'missed' && "border-yellow-500 bg-yellow-50",
              showResult && optionStatus === 'normal' && "border-gray-200",
            )}
            onClick={() => !showResult && onOptionSelect(option.id)}
          >
            <div className={cn(
              "p-4 flex items-start gap-3 cursor-pointer",
              showResult && "cursor-default"
            )}>
              {/* Option Label (A, B, C, etc.) */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full shrink-0 font-semibold",
                isSelected && !showResult && "bg-primary text-white",
                !isSelected && !showResult && "bg-gray-100 text-gray-700",
                optionStatus === 'correct' && "bg-green-500 text-white",
                optionStatus === 'wrong' && "bg-red-500 text-white",
                optionStatus === 'missed' && "bg-yellow-500 text-white",
                showResult && optionStatus === 'normal' && "bg-gray-200 text-gray-700",
              )}>
                {alphabet[index]}-
              </div>
              
              {/* Option Text */}
              <div className="flex-1">
                <p className={cn(
                  "text-gray-800",
                  optionStatus === 'correct' && "text-green-800",
                  optionStatus === 'wrong' && "text-red-800",
                  optionStatus === 'missed' && "text-yellow-800",
                )}>
                  {option.text}
                </p>
              </div>
              
              {/* Result Indicator */}
              {showResult && (
                <div className="ml-2">
                  {optionStatus === 'correct' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {optionStatus === 'wrong' && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              )}
            </div>
            
            {/* Explanation (shown after answering) */}
            {showResult && option.is_correct && question.explanation && (
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-700">{question.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
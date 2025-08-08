import { Question, Option } from "@/types";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage"; // Import if not already used

interface QcmQuestionProps {
  question: Question;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  isPartiallyCorrect?: boolean;
  isRetryMode?: boolean;
  currentLanguage: string; // Add this prop
}

export default function QcmQuestion({
  question,
  selectedOptions,
  onOptionSelect,
  showResult = false,
  isCorrect = false,
  isPartiallyCorrect = false,
  isRetryMode = false,
  currentLanguage = "en" // Default to English
}: QcmQuestionProps) {
  // Get the explanation in the current language
  const getExplanationText = () => {
    if (currentLanguage === "fr") {
      return question.explanation_fr || question.explanation_en || question.explanation || "";
    }
    return question.explanation_en || question.explanation_fr || question.explanation || "";
  };

  // Get options properly sorted and localized
  const getLocalizedOptions = () => {
    return (question.options || []).map(option => {
      return {
        ...option,
        displayText: currentLanguage === "fr" 
          ? option.text_fr || option.text_en || option.text 
          : option.text_en || option.text_fr || option.text
      };
    });
  };

  const options = getLocalizedOptions();

  return (
    <div>
      {/* Options */}
      <div className="space-y-2">
        {options.map(option => {
          const isSelected = selectedOptions.includes(option.id);
          const isCorrectOption = option.is_correct;
          const isWrongSelection = isSelected && !isCorrectOption && showResult;
          
          return (
            <div 
              key={option.id} 
              className={cn(
                "border rounded-lg p-3 cursor-pointer",
                isSelected && "border-primary bg-primary/5",
                showResult && isCorrectOption && "border-green-500 bg-green-50",
                isWrongSelection && "border-red-500 bg-red-50",
                !showResult && "hover:bg-gray-50"
              )}
              onClick={() => !showResult && onOptionSelect(option.id)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary" : "border border-gray-400"
                )}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-grow">
                  <p>{option.displayText}</p>
                </div>
                {showResult && isCorrectOption && (
                  <CheckIcon className="text-green-600 h-5 w-5 flex-shrink-0" />
                )}
                {isWrongSelection && (
                  <XIcon className="text-red-600 h-5 w-5 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation when showing results */}
      {showResult && getExplanationText() && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <h5 className="font-medium mb-1">Explanation:</h5>
          <p>{getExplanationText()}</p>
        </div>
      )}

      {/* Result indicator */}
      {showResult && (
        <div className="mt-4 flex items-center">
          {isCorrect && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="mr-1 h-4 w-4" />
              <span className="font-medium">Correct</span>
            </div>
          )}
          {isPartiallyCorrect && (
            <div className="flex items-center text-yellow-600">
              <AlertTriangleIcon className="mr-1 h-4 w-4" />
              <span className="font-medium">Partially Correct</span>
            </div>
          )}
          {!isCorrect && !isPartiallyCorrect && (
            <div className="flex items-center text-red-600">
              <XIcon className="mr-1 h-4 w-4" />
              <span className="font-medium">Incorrect</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
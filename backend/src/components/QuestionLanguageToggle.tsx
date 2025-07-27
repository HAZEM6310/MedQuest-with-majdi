
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface QuestionLanguageToggleProps {
  englishText: string;
  frenchText: string;
  englishOptions?: string[];
  frenchOptions?: string[];
}

export default function QuestionLanguageToggle({ 
  englishText, 
  frenchText, 
  englishOptions = [], 
  frenchOptions = [] 
}: QuestionLanguageToggleProps) {
  const { language, t } = useLanguage();
  const [showAlternate, setShowAlternate] = useState(false);
  
  const isShowingEnglish = (language === 'en' && !showAlternate) || (language === 'fr' && showAlternate);
  const currentText = isShowingEnglish ? englishText : frenchText;
  const currentOptions = isShowingEnglish ? englishOptions : frenchOptions;
  
  const toggleLanguage = () => {
    setShowAlternate(!showAlternate);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="transition-all duration-300 ease-in-out">
            <p className="text-lg font-medium">{currentText}</p>
            {currentOptions.length > 0 && (
              <div className="mt-4 space-y-2">
                {currentOptions.map((option, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="ml-4 flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {isShowingEnglish ? t('quiz.showFrench') : t('quiz.showEnglish')}
        </Button>
      </div>
      
      {showAlternate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAlternate(false)}
          className="text-muted-foreground"
        >
          {t('quiz.showOriginal')}
        </Button>
      )}
    </div>
  );
}

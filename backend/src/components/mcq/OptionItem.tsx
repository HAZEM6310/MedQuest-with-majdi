import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { Option } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface OptionItemProps {
  option: Option;
  index: number;
  isSelected: boolean;
  showResult: boolean;
  onSelect: () => void;
  userAnswers: string[];
  percentage?: number;
}

export default function OptionItem({
  option,
  index,
  isSelected,
  showResult,
  onSelect,
  userAnswers,
  percentage
}: OptionItemProps) {
  const { language } = useLanguage();
  
  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  const letter = String.fromCharCode(65 + index); // A, B, C, D
  const optionText = getLocalizedText(option.text_en, option.text_fr, option.text);
  
  const getOptionState = () => {
    if (!showResult) {
      return isSelected ? 'selected' : 'default';
    }
    
    const wasSelected = userAnswers.includes(option.id);
    
    if (option.is_correct && wasSelected) return 'correct-selected';
    if (option.is_correct && !wasSelected) return 'correct-not-selected'; 
    if (!option.is_correct && wasSelected) return 'incorrect-selected';
    return 'not-selected';
  };

  const state = getOptionState();

  const getStateStyles = () => {
    switch (state) {
      case 'selected':
        return "border-primary bg-primary/10 text-primary hover:bg-primary/15";
      case 'correct-selected':
        return "border-green-500 bg-green-100 text-green-700";
      case 'correct-not-selected':
        return "border-yellow-500 bg-yellow-100 text-yellow-700";
      case 'incorrect-selected':
        return "border-red-500 bg-red-100 text-red-700";
      default:
        return "border-border hover:border-accent-foreground/20 hover:bg-accent/50";
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'correct-selected':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'correct-not-selected':
        return <Check className="h-5 w-5 text-yellow-600" />;
      case 'incorrect-selected':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        showResult ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-[1.01]",
        "transition-all duration-200 hover:shadow-md group",
        getStateStyles()
      )}
      onClick={!showResult ? onSelect : undefined}
      tabIndex={showResult ? -1 : 0}
      aria-disabled={showResult}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Letter Badge */}
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm transition-colors",
            state === 'selected' && "border-primary bg-primary text-primary-foreground",
            state === 'correct-selected' && "border-green-600 bg-green-600 text-white",
            state === 'correct-not-selected' && "border-yellow-600 bg-yellow-600 text-white",
            state === 'incorrect-selected' && "border-red-600 bg-red-600 text-white",
            state === 'default' && "border-muted-foreground/40 text-muted-foreground group-hover:border-foreground/60",
            state === 'not-selected' && "border-muted-foreground/40 text-muted-foreground"
          )}>
            {letter}
          </div>

          {/* Option Text */}
          <div className="flex-1 text-sm leading-relaxed">
            {optionText}
          </div>

          {/* Result Indicators */}
          <div className="flex items-center gap-3">
            {/* Percentage Badge */}
            {showResult && percentage !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {percentage}%
              </Badge>
            )}
            
            {/* State Icon */}
            {showResult && getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
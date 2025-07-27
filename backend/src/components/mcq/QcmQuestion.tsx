import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptionItem from './OptionItem';
import { Question } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { MessageSquare, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface QcmQuestionProps {
  question: Question;
  selectedOptions: string[];
  showResult: boolean;
  isCorrect?: boolean;
  onOptionSelect: (optionId: string) => void;
  userAnswers: string[];
}

export default function QcmQuestion({
  question,
  selectedOptions,
  showResult,
  isCorrect,
  onOptionSelect,
  userAnswers
}: QcmQuestionProps) {
  const { t, language } = useLanguage();
  const [showExplanation, setShowExplanation] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  // Mock statistics data - in real app, this would come from the database
  const getOptionStatistics = (optionId: string) => {
    // Simulate user selection percentages
    const stats = {
      [question.options?.[0]?.id || '']: 45,
      [question.options?.[1]?.id || '']: 25,
      [question.options?.[2]?.id || '']: 20,
      [question.options?.[3]?.id || '']: 10,
    };
    return stats[optionId] || 0;
  };

  const questionText = getLocalizedText(question.text_en, question.text_fr, question.text);
  const explanationText = getLocalizedText(question.explanation_en, question.explanation_fr, question.explanation);

  return (
    <Card className="shadow-lg border-primary/20 bg-background/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl leading-relaxed flex-1">
            {questionText}
          </CardTitle>
          
          {showResult && (
            <Badge 
              variant={isCorrect ? "default" : "destructive"} 
              className="shrink-0 text-sm px-3 py-1"
            >
              {isCorrect ? t('progress.correct') : t('quiz.results.wrong')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Options */}
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <OptionItem
              key={option.id}
              option={option}
              index={index}
              isSelected={selectedOptions.includes(option.id)}
              showResult={showResult}
              onSelect={() => onOptionSelect(option.id)}
              userAnswers={userAnswers}
              percentage={showResult ? getOptionStatistics(option.id) : undefined}
            />
          ))}
        </div>

        {/* Result Actions */}
        {showResult && (
          <div className="flex gap-3 pt-4 border-t border-border/20">
            {explanationText && (
              <Collapsible open={showExplanation} onOpenChange={setShowExplanation}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {showExplanation ? 'Hide' : 'Show'} Explanation
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card className="bg-blue-50/50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Explanation
                      </h4>
                      <p className="text-blue-800 leading-relaxed">
                        {explanationText}
                      </p>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}

            <Collapsible open={showStatistics} onOpenChange={setShowStatistics}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Badge className="h-4 w-4" />
                  {showStatistics ? 'Hide' : 'Show'} Statistics
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card className="bg-gray-50/50 border-gray-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      User Response Statistics
                    </h4>
                    <div className="space-y-2">
                      {question.options?.map((option, index) => {
                        const percentage = getOptionStatistics(option.id);
                        const letter = String.fromCharCode(65 + index);
                        
                        return (
                          <div key={option.id} className="flex items-center gap-3">
                            <span className="font-mono text-sm w-6">{letter}:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10 text-right">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
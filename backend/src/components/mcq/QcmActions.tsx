import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Flag } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface QcmActionsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFinish: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  showResult: boolean;
  hasSelectedOptions: boolean;
}

export default function QcmActions({
  onPrevious,
  onNext,
  onSubmit,
  onFinish,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  showResult,
  hasSelectedOptions
}: QcmActionsProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="gap-2 min-w-[120px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Middle Action */}
          <div className="flex gap-3">
            {!showResult && hasSelectedOptions && (
              <Button
                onClick={onSubmit}
                className="gap-2 min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Verify Answer
              </Button>
            )}
          </div>

          {/* Next/Finish Button */}
          {showResult ? (
            isLastQuestion ? (
              <Button
                onClick={onFinish}
                className="gap-2 min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                <Flag className="h-4 w-4" />
                Finish Quiz
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!canGoNext}
                className="gap-2 min-w-[120px]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              variant="outline"
              className="gap-2 min-w-[120px]"
            >
              Skip
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
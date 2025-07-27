
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle, XCircle, Clock, Target, RotateCcw, Eye, Home } from "lucide-react";

interface QuizResultsPanelProps {
  finalGrade: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timePerQuestion?: string;
  onViewQuestions: () => void;
  onStartOver: () => void;
  onRetryWrong: () => void;
  onQuit: () => void;
}

export default function QuizResultsPanel({
  finalGrade,
  score,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  timePerQuestion = "00 min 45 sec",
  onViewQuestions,
  onStartOver,
  onRetryWrong,
  onQuit
}: QuizResultsPanelProps) {
  const { t } = useLanguage();

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-green-600";
    if (grade >= 12) return "text-blue-600";
    if (grade >= 8) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 16) return "default";
    if (grade >= 12) return "secondary";
    return "destructive";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">{t('quiz.results.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Average */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">{t('quiz.results.generalAverage')}</span>
            </div>
            <div className={`text-3xl font-bold ${getGradeColor(finalGrade)}`}>
              {finalGrade.toFixed(1)} / 20
            </div>
          </div>

          {/* Time per Question */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">{t('quiz.results.timePerQuestion')}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {timePerQuestion}
            </div>
          </div>

          {/* Results Breakdown */}
          <div className="space-y-3">
            {/* Success */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">{t('quiz.results.success')}</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                {correctAnswers} {t('quiz.results.responses')}
              </Badge>
            </div>

            {/* Wrong */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700">{t('quiz.results.wrong')}</span>
              </div>
              <Badge variant="destructive">
                {wrongAnswers} {t('quiz.results.responses')}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={onViewQuestions} className="w-full bg-blue-600 hover:bg-blue-700">
              <Eye className="h-4 w-4 mr-2" />
              {t('quiz.results.viewQuestions')}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onStartOver} variant="outline" className="text-blue-600">
                <RotateCcw className="h-4 w-4 mr-1" />
                {t('quiz.results.startOver')}
              </Button>
              
              {wrongAnswers > 0 && (
                <Button onClick={onRetryWrong} variant="outline" className="text-orange-600">
                  {t('quiz.results.retryWrong')}
                </Button>
              )}
            </div>
            
            <Button onClick={onQuit} variant="outline" className="w-full text-red-600">
              <Home className="h-4 w-4 mr-2" />
              {t('quiz.results.quit')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Question {
  id: string;
  text?: string;
  text_en?: string;
  text_fr?: string;
  explanation?: string;
  explanation_en?: string;
  explanation_fr?: string;
  options?: Array<{
    id: string;
    text?: string;
    text_en?: string;
    text_fr?: string;
    is_correct: boolean;
  }>;
}

interface QuizReviewProps {
  questions: Question[];
  userAnswers: {[key: string]: string[]};
  onBack: () => void;
}

export default function QuizReview({ questions, userAnswers, onBack }: QuizReviewProps) {
  const { t, language } = useLanguage();

  const getLocalizedText = (enText?: string, frText?: string, defaultText?: string) => {
    if (language === 'en') {
      return enText || defaultText || '';
    }
    return frText || defaultText || '';
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('quiz.reviewQuestions')}</h1>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('ui.back')}
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const userQuestionAnswers = userAnswers[question.id] || [];
          const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
          const isCorrect = userQuestionAnswers.length === correctOptions.length &&
                           userQuestionAnswers.every(answerId => correctOptions.some(opt => opt.id === answerId));

          return (
            <Card key={question.id} className="border-l-4 border-l-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {t('quiz.question')} {index + 1}: {getLocalizedText(question.text_en, question.text_fr, question.text)}
                  </CardTitle>
                  <Badge variant={isCorrect ? "default" : "destructive"} className="shrink-0">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('progress.correct')}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        {t('quiz.results.wrong')}
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User's Answer */}
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">{t('quiz.yourAnswer')}:</h4>
                  <div className="space-y-2">
                    {userQuestionAnswers.length > 0 ? (
                      userQuestionAnswers.map(answerId => {
                        const option = question.options?.find(opt => opt.id === answerId);
                        if (!option) return null;
                        return (
                          <div 
                            key={answerId}
                            className={`p-3 rounded-lg border ${
                              option.is_correct 
                                ? 'border-green-500 bg-green-50 text-green-700' 
                                : 'border-red-500 bg-red-50 text-red-700'
                            }`}
                          >
                            {getLocalizedText(option.text_en, option.text_fr, option.text)}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500">
                        {t('quiz.results.incomplete')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Correct Answer */}
                <div>
                  <h4 className="font-medium mb-2 text-green-600">{t('quiz.correctAnswer')}:</h4>
                  <div className="space-y-2">
                    {correctOptions.map(option => (
                      <div 
                        key={option.id}
                        className="p-3 rounded-lg border border-green-500 bg-green-50 text-green-700"
                      >
                        {getLocalizedText(option.text_en, option.text_fr, option.text)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Options for Reference */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-600">All Options:</h4>
                  <div className="space-y-2">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          option.is_correct
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{getLocalizedText(option.text_en, option.text_fr, option.text)}</span>
                          {option.is_correct && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">{t('quiz.explanation')}:</h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {getLocalizedText(question.explanation_en, question.explanation_fr, question.explanation)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

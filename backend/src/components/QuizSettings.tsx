
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QuizSettings as QuizSettingsType } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

interface QuizSettingsProps {
  onStart: (settings: QuizSettingsType) => void;
  courseName: string;
  questionCount: number;
}

export default function QuizSettings({ onStart, courseName, questionCount }: QuizSettingsProps) {
  const { t } = useLanguage();
  const [showAnswersImmediately, setShowAnswersImmediately] = useState(true);

  const handleStart = () => {
    onStart({ showAnswersImmediately });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('quiz.settings.title')}</CardTitle>
        <p className="text-muted-foreground">{courseName}</p>
        <p className="text-sm text-secondary">{questionCount} {t('course.questions')}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="immediate-answers" className="text-base font-medium">
              {t('quiz.settings.showAnswers')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('quiz.settings.showAnswersDesc')}
            </p>
          </div>
          <Switch
            id="immediate-answers"
            checked={showAnswersImmediately}
            onCheckedChange={setShowAnswersImmediately}
          />
        </div>
        
        <div className="pt-4">
          <Button onClick={handleStart} className="w-full bg-secondary hover:bg-secondary/90">
            {t('quiz.settings.start')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

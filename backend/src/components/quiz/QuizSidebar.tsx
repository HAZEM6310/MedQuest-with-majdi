import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/hooks/useLanguage';
import { Pencil, PieChart } from 'lucide-react';
import NotesPanel from './NotesPanel';

interface QuizSidebarProps {
  questionId: string;
  totalQuestions?: number;
  currentQuestionIndex?: number;
  answeredQuestions?: Record<string, boolean>;
  onQuestionSelect?: (index: number) => void;
  children?: React.ReactNode;
}

export default function QuizSidebar({
  questionId,
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionSelect,
  children
}: QuizSidebarProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("progress");

  return (
    <div className="h-full flex flex-col">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>{t('quiz.progress')}</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            <span>{t('quiz.notes')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="flex-1 mt-2">
          {children}
        </TabsContent>
        
        <TabsContent value="notes" className="flex-1 mt-2">
          <NotesPanel questionId={questionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState } from 'react';
import { Question } from '../services/quizService';
import { Button, Card, Checkbox } from './ui';

interface QuizQuestionProps {
  question: Question;
  onSubmit: (selectedOptions: string[]) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onSubmit }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };
  
  const handleSubmit = async () => {
    if (selectedOptions.length === 0) return;
    
    setIsSubmitting(true);
    await onSubmit(selectedOptions);
    setIsSubmitting(false);
    setSelectedOptions([]);
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">{question.text}</h3>
      
      <div className="space-y-4 mb-8">
        {question.options.map(option => (
          <div 
            key={option.id} 
            className="flex items-start border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleOptionToggle(option.id)}
          >
            <Checkbox
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleOptionToggle(option.id)}
              id={`option-${option.id}`}
              className="mt-1"
            />
            <label 
              htmlFor={`option-${option.id}`}
              className="ml-3 cursor-pointer flex-1"
            >
              {option.text}
            </label>
          </div>
        ))}
      </div>
      
      <Button
        variant="primary"
        disabled={selectedOptions.length === 0 || isSubmitting}
        onClick={handleSubmit}
        className="w-full md:w-auto"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </Card>
  );
};

export default QuizQuestion;
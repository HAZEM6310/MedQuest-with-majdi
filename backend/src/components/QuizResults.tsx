import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizState, Question } from '../services/quizService';
import { Button, Card } from './ui';

interface QuizResultsProps {
  quizState: QuizState;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizState }) => {
  const navigate = useNavigate();
  const percentage = Math.round((quizState.score / quizState.totalQuestions) * 100);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100">
            <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
          </div>
          
          <div>
            <p className="text-lg mb-2">
              You scored <span className="font-bold">{quizState.score}</span> out 
              of <span className="font-bold">{quizState.totalQuestions}</span> questions.
            </p>
            
            {percentage >= 80 ? (
              <p className="text-green-600 font-medium">Great job! You've passed the quiz.</p>
            ) : percentage >= 60 ? (
              <p className="text-yellow-600 font-medium">You've passed, but there's room for improvement.</p>
            ) : (
              <p className="text-red-600 font-medium">You didn't pass. Consider studying more and trying again.</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/courses`)}
          >
            Back to Courses
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => navigate(`/quiz/${quizState.questions[0]?.id}`)}
          >
            Review Quiz
          </Button>
        </div>
      </Card>
      
      <h3 className="text-xl font-semibold mb-4">Question Review</h3>
      
      {quizState.questions.map((question, index) => (
        <QuestionReview 
          key={question.id} 
          question={question}
          questionNumber={index + 1}
          userAnswer={quizState.userAnswers[question.id]}
        />
      ))}
    </div>
  );
};

interface QuestionReviewProps {
  question: Question;
  questionNumber: number;
  userAnswer?: {
    selected_options: string[];
    is_correct: boolean;
  };
}

const QuestionReview: React.FC<QuestionReviewProps> = ({ 
  question, 
  questionNumber, 
  userAnswer 
}) => {
  const isAnswered = !!userAnswer;
  const isCorrect = isAnswered && userAnswer.is_correct;
  
  return (
    <Card 
      className={`p-6 mb-4 ${
        !isAnswered 
          ? 'border-gray-200' 
          : isCorrect 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-center mb-4">
        <span className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white mr-3
          ${!isAnswered ? 'bg-gray-500' : isCorrect ? 'bg-green-500' : 'bg-red-500'}
        `}>
          {questionNumber}
        </span>
        <h4 className="text-lg font-medium">{question.text}</h4>
      </div>
      
      <div className="space-y-3 mb-4">
        {question.options.map(option => {
          // Determine styling for each option
          const isSelected = userAnswer?.selected_options.includes(option.id);
          const isCorrectOption = option.is_correct;
          
          let optionClass = 'border border-gray-200 rounded-md p-3 flex items-center';
          
          if (isSelected && isCorrectOption) {
            optionClass += ' bg-green-100 border-green-300';
          } else if (isSelected && !isCorrectOption) {
            optionClass += ' bg-red-100 border-red-300';
          } else if (!isSelected && isCorrectOption) {
            optionClass += ' bg-green-50 border-green-200';
          }
          
          return (
            <div key={option.id} className={optionClass}>
              {isSelected && (
                <svg className={`w-5 h-5 mr-2 ${isCorrectOption ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCorrectOption ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              )}
              
              {!isSelected && isCorrectOption && (
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              
              <span>{option.text}</span>
            </div>
          );
        })}
      </div>
      
      {question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h5 className="font-medium mb-1">Explanation:</h5>
          <p>{question.explanation}</p>
        </div>
      )}
    </Card>
  );
};

export default QuizResults;
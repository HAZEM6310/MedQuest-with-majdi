import React, { useState, useEffect } from 'react';

interface QuizTimerProps {
  initialSeconds: number;
  onTimeUpdate: (remainingSeconds: number) => void;
  onTimeExpired: () => void;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ 
  initialSeconds, 
  onTimeUpdate, 
  onTimeExpired 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  
  useEffect(() => {
    if (initialSeconds !== timeRemaining) {
      setTimeRemaining(initialSeconds);
    }
  }, [initialSeconds]);
  
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeExpired();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUpdate, onTimeExpired]);
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Format time as MM:SS
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Determine color based on time remaining
  let timerColor = 'text-green-600';
  if (timeRemaining < 300) { // Less than 5 minutes
    timerColor = 'text-red-600';
  } else if (timeRemaining < 600) { // Less than 10 minutes
    timerColor = 'text-yellow-600';
  }
  
  return (
    <div className="flex items-center">
      <svg 
        className="w-4 h-4 mr-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className={`font-mono font-bold ${timerColor}`}>
        {formattedTime}
      </span>
    </div>
  );
};

export default QuizTimer;
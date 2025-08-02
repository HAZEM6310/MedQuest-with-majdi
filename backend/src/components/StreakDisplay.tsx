import { useStreak } from '@/hooks/useStreak';
import { Flame } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StreakDisplayProps {
  className?: string;
}

export function StreakDisplay({ className }: StreakDisplayProps) {
  const { streak, isLoading } = useStreak();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md", className)}>
        <Flame className="h-4 w-4 text-gray-300" />
        <Skeleton className="h-4 w-6" />
      </div>
    );
  }

  // Different color intensities based on streak length
  const getStreakStyle = (count: number) => {
    if (count >= 30) return "bg-orange-200 dark:bg-orange-900 border-orange-300 dark:border-orange-800";
    if (count >= 14) return "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-900";
    return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  };

  const getFlameColor = (count: number) => {
    if (count >= 30) return "text-orange-600 dark:text-orange-400";
    if (count >= 14) return "text-orange-500 dark:text-orange-500";
    return "text-gray-400 dark:text-gray-500";
  };

  const getTextColor = (count: number) => {
    if (count >= 30) return "text-orange-700 dark:text-orange-300";
    if (count >= 14) return "text-orange-600 dark:text-orange-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border", 
              getStreakStyle(streak),
              className
            )}
          >
            <Flame className={cn("h-4 w-4", getFlameColor(streak))} />
            <span className={cn("font-semibold", getTextColor(streak))}>
              {streak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{t('streak.tooltip', { count: streak })}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('streak.description')}</p>
          {streak >= 7 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-orange-500">
                {t('streak.milestone', { count: streak })}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-center text-lg font-medium text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
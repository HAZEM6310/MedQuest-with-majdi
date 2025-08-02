import React, { createContext, useContext, useState, useCallback } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const startLoading = useCallback((msg?: string) => {
    setIsLoading(true);
    setMessage(msg);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingOverlay isLoading={isLoading} message={message} />
    </LoadingContext.Provider>
  );
}
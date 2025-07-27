import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function Serieresult() {
  const navigate = useNavigate();
  // Placeholder result data; replace with real data fetching logic
  const [result] = useState({
    correct: 8,
    wrong: 2,
    partial: 0,
    total: 10,
    avgTime: 32, // seconds
    score: 16, // out of 20
  });

  const handleRetry = () => {
    // Implement retry logic or navigation
    navigate(-1); // Go back for now
  };

  const handleViewQuestions = () => {
    // Implement navigation to view questions
    navigate("/courses"); // Example: go to courses
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Résultats du QCM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row justify-between gap-6 mb-6">
            <div className="flex flex-col items-center flex-1">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <span className="font-semibold text-lg">{result.correct}</span>
              <span className="text-sm text-muted-foreground">Correctes</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <XCircle className="h-8 w-8 text-red-500 mb-2" />
              <span className="font-semibold text-lg">{result.wrong}</span>
              <span className="text-sm text-muted-foreground">Fautes</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <span className="font-semibold text-lg">{result.avgTime}s</span>
              <span className="text-sm text-muted-foreground">Temps/question</span>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold">{result.score} / 20</span>
            <div className="text-muted-foreground text-sm">Score</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleViewQuestions}>
              Voir les questions
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleRetry}>
              Recommencer
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/courses")}
            >
              Retour aux cours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
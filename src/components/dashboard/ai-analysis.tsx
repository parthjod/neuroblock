"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Bot } from "lucide-react";
import { getAIAnalysis } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@/lib/types";

type AIAnalysisProps = {
  session: Session;
};

type AnalysisData = {
  clinicalExplanation: string;
  recommendations: string;
};

export default function AIAnalysis({ session }: AIAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAnalysis = useCallback(async () => {
    if (analysis) return; // Don't refetch if we already have it

    setIsLoading(true);
    setError(null);
    try {
      // For simplicity, we'll use the average metrics of the first exercise
      const exercise = session.exercises[0];
      if (!exercise) {
        throw new Error("No exercise data available for this session.");
      }
      const result = await getAIAnalysis(
        exercise.name,
        exercise.rangeOfMotion,
        exercise.stability,
        exercise.accuracy
      );
      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch AI analysis.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [analysis, session.exercises]);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      handleFetchAnalysis();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BrainCircuit className="h-4 w-4 mr-2" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI-Assisted Clinical Reasoning
          </DialogTitle>
          <DialogDescription>
            Analysis of hand movement quality for the session on{" "}
            {new Date(session.date).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {analysis && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Clinical Explanation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.clinicalExplanation}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Recommendations
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.recommendations}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

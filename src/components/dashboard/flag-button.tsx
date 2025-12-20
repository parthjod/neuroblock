"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Flag, FlagOff } from "lucide-react";
import { flagSessionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type FlagButtonProps = {
  patientId: string;
  sessionId: string;
  isFlagged: boolean;
};

export default function FlagButton({
  patientId,
  sessionId,
  isFlagged,
}: FlagButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFlag = () => {
    startTransition(async () => {
      const result = await flagSessionAction(patientId, sessionId, !isFlagged);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFlag}
            disabled={isPending}
            className={isFlagged ? "text-destructive hover:text-destructive" : ""}
          >
            {isPending ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : isFlagged ? (
              <FlagOff className="h-4 w-4" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            <span className="sr-only">{isFlagged ? "Unflag Session" : "Flag Session"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFlagged ? 'Unflag for review' : 'Flag for review'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

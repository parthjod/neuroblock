"use client";

import React, { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createNewSession } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { SessionWithRelations, Patient } from "@/lib/types";
import { ProgressRing } from "./progress-ring";
import { Loader2, Camera } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type SessionState = "idle" | "tracking" | "processing" | "complete" | "error";

interface SessionModalProps {
    patient: Patient;
    isOpen: boolean;
    onClose: () => void;
    onSessionCreated: (session: SessionWithRelations) => void;
}

export default function SessionModal({
  patient,
  isOpen,
  onClose,
  onSessionCreated,
}: SessionModalProps) {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [newSessionData, setNewSessionData] = useState<SessionWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    // Check for camera permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setHasCameraPermission(true))
            .catch(() => setHasCameraPermission(false));
    }
  }, []);

  const handleClose = () => {
    if (sessionState !== 'processing') {
        setSessionState("idle");
        onClose();
    }
  };

  const handleStartSession = () => {
    if (hasCameraPermission) {
        setSessionState("tracking");
        // Simulate some processing
        setTimeout(() => {
            startTransition(() => {
                createNewSession({ patientId: patient.id, reps: 10, duration: 60, rom: 90})
                .then((session) => {
                    if(session) {
                        setNewSessionData(session);
                        onSessionCreated(session);
                        setSessionState("complete");
                    } else {
                        setSessionState("error");
                    }
                })
                .catch(()=>setSessionState("error"));
            });
        }, 3000);
    }
  };

  const renderContent = () => {
    switch (sessionState) {
      case "complete":
        return (
          <div className="flex flex-col items-center justify-center space-y-4 h-80">
            <ProgressRing status={newSessionData?.status ?? 'Stable'} />
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">Recovery Trend Score: {newSessionData?.recoveryTrendScore}</p>
            <p className="text-xs text-muted-foreground/80 max-w-xs text-center">
                This session has been immutably recorded on the blockchain.
            </p>
          </div>
        );
      case "tracking":
      case "processing":
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-80">
                <Loader2 className="w-16 h-16 text-primary animate-spin"/>
                <h2 className="text-2xl font-bold">Session in progress...</h2>
                <p className="text-muted-foreground">Please continue the exercises.</p>
            </div>
        );
      case "error":
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-80">
                <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
                <p className="text-muted-foreground">Could not save the session. Please try again.</p>
                <Button onClick={() => setSessionState("idle")}>Try Again</Button>
            </div>
        );
      case "idle":
      default:
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-80">
                <div className="relative w-64 h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && (
                         <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-muted-foreground/50"/>
                         </div>
                    )}
                </div>

                { !hasCameraPermission ? (
                    <Alert variant="destructive" className="w-64">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold">Ready to start?</h2>
                        <p className="text-muted-foreground text-center text-sm">
                            Ensure the patient's hand is visible to the camera.
                        </p>
                    </>
                )}
            </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={!isPending && sessionState !== 'processing' ? handleClose : undefined}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Session for {patient.name}</DialogTitle>
          <DialogDescription>
            Follow the on-screen instructions to complete the rehabilitation exercises.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">{renderContent()}</div>

        <DialogFooter>
            {sessionState === 'idle' && (
                <Button onClick={handleStartSession} className="w-full" disabled={!hasCameraPermission}>Start Session</Button>
            )}
            {sessionState === 'complete' && (
                <Button onClick={handleClose} className="w-full">Done</Button>
            )}
            {(sessionState === 'tracking' || sessionState === 'processing') && (
                <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Session in progress...
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
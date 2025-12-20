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
import type { Patient, Session } from "@/lib/types";
import { Camera, Hand, Loader2 } from "lucide-react";
import ProgressRing from "./progress-ring";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type SessionModalProps = {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (patients: Patient[]) => void;
};

type SessionState = "idle" | "tracking" | "processing" | "complete";

export default function SessionModal({
  patient,
  isOpen,
  onClose,
  onSessionCreated,
}: SessionModalProps) {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [newSessionData, setNewSessionData] = useState<Session | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);


  const exercises = ["Hand Open/Close", "Wrist Flexion", "Finger Pinch"];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isOpen) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isOpen, toast]);

  const handleEndSession = useCallback(() => {
    setSessionState("processing");
    startTransition(async () => {
      const result = await createNewSession(patient.id, patient.sessions);
      if (result.success && result.data) {
        setNewSessionData(result.data);
        setSessionState("complete");
        onSessionCreated(result.patients);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setSessionState("idle");
      }
    });
  }, [patient.id, patient.sessions, onSessionCreated, toast, startTransition]);

  useEffect(() => {
    if (sessionState !== 'tracking') {
      return;
    }
    const interval = setInterval(() => {
      setCurrentExerciseIndex(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionState]);

  useEffect(() => {
    if (currentExerciseIndex >= exercises.length) {
      if (sessionState === 'tracking') {
        handleEndSession();
      }
    }
  }, [currentExerciseIndex, sessionState, exercises.length, handleEndSession]);

  const handleStartSession = () => {
    if(!hasCameraPermission) {
        toast({
            variant: "destructive",
            title: "Cannot Start Session",
            description: "Camera access is required to start a session.",
        });
        return;
    }
    setSessionState("tracking");
  };

  const handleClose = () => {
    onClose();
    // Delay resetting state to allow for exit animation
    setTimeout(() => {
        setSessionState("idle");
        setNewSessionData(null);
        setCurrentExerciseIndex(0);
    }, 300);
  };

  const renderContent = () => {
    switch (sessionState) {
      case "tracking":
      case "processing":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 h-80">
            <div className="relative w-64 h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            </div>
            <div className="text-center">
                <p className="text-muted-foreground">Tracking exercise:</p>
                <p className="text-lg font-medium flex items-center gap-2">
                    <Hand className="w-5 h-5 text-primary" />
                    {exercises[currentExerciseIndex]}
                </p>
            </div>
            {sessionState === "processing" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing and recording on blockchain...
                </div>
            )}
          </div>
        );
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

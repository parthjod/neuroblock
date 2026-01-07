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
import ProgressRing from "./progress-ring";
import { Loader2, Camera, Video, VideoOff, Square } from "lucide-react";
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
  const [newSessionData, setNewSessionData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  useEffect(() => {
    // Check for camera permission and setup stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((mediaStream) => {
                setHasCameraPermission(true);
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            })
            .catch(() => setHasCameraPermission(false));
    }
  }, []);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [stream]);

  useEffect(() => {
    // Update recording duration
    let interval: NodeJS.Timeout;
    if (isRecording && recordingStartTime > 0) {
        interval = setInterval(() => {
            setRecordingDuration(Math.floor((Date.now() - recordingStartTime) / 1000));
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  const handleClose = () => {
    if (sessionState !== 'processing') {
        stopRecording();
        setSessionState("idle");
        onClose();
    }
  };

  const startRecording = useCallback(() => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });

    const chunks: Blob[] = [];
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const duration = Date.now() - recordingStartTime;
      
      // Create thumbnail
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);
      video.currentTime = 1; // Capture frame at 1 second
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg');
          
          setRecordingData({
            blob,
            duration,
            thumbnail
          });
        }
      };
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingStartTime(Date.now());
    setRecordingDuration(0);
  }, [stream, recordingStartTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  const handleStartSession = () => {
    if (hasCameraPermission) {
        setSessionState("tracking");
        startRecording();
        
        // Simulate some processing after recording
        setTimeout(() => {
            stopRecording();
            setSessionState("processing");
            
            setTimeout(() => {
                startTransition(async () => {
                    const result = await createNewSession(patient.id);
                    if (result.success && result.data) {
                        setNewSessionData(result.data);
                        onSessionCreated(result.data);
                        setSessionState("complete");
                    } else {
                        setSessionState("error");
                    }
                });
            }, 2000);
        }, 10000); // Record for 10 seconds
    }
  };

  const renderContent = () => {
    switch (sessionState) {
      case "complete":
        return (
          <div className="flex flex-col items-center justify-center space-y-4 h-80">
            <ProgressRing status={newSessionData?.status as 'Improvement' | 'Stable' | 'Decline' ?? 'Stable'} />
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">Recovery Trend Score: {newSessionData?.recoveryTrendScore}</p>
            {recordingData && (
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <Video className="w-4 h-4" />
                <span>Video recorded ({Math.floor(recordingData.duration / 1000)}s)</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground/80 max-w-xs text-center">
                RTS score has been saved to the database and recorded on the blockchain.
            </p>
          </div>
        );
      case "tracking":
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-80">
                <div className="relative w-64 h-48 bg-muted rounded-lg overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {isRecording && (
                        <div className="absolute top-2 right-2 flex items-center space-x-2 bg-red-600 text-white px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-xs">REC {recordingDuration}s</span>
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-semibold">Recording in progress...</h2>
                <p className="text-muted-foreground text-center text-sm">
                    Please continue the rehabilitation exercises.
                </p>
            </div>
        );
      case "processing":
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-80">
                <Loader2 className="w-16 h-16 text-primary animate-spin"/>
                <h2 className="text-2xl font-bold">Processing session...</h2>
                <p className="text-muted-foreground">Analyzing movement and updating dashboard.</p>
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
                        <p className="text-xs text-muted-foreground/60 text-center">
                            The session will be recorded for analysis and progress tracking.
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
"use server";

import { explainHandMovementQuality } from "@/ai/flows/explain-hand-movement-quality";
import { flagSession as flagSessionInData, addSessionToPatient as addSessionToPatientData, getPatients } from "@/lib/data";
import { recordFlagOnChain, recordSessionOnChain } from "@/lib/blockchain";
import type { Patient, Session, Exercise } from "./types";
import { revalidatePath } from "next/cache";

export async function getAIAnalysis(
  movementDescription: string,
  rangeOfMotionPercentage: number,
  stabilityVariance: number,
  completionAccuracy: number
) {
  try {
    const result = await explainHandMovementQuality({
      movementDescription,
      rangeOfMotionPercentage,
      stabilityVariance,
      completionAccuracy,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { success: false, error: "Failed to get AI analysis." };
  }
}

export async function flagSessionAction(
  patientId: string,
  sessionId: string,
  isFlagged: boolean
) {
  try {
    const blockchainResponse = await recordFlagOnChain(
      patientId,
      sessionId,
      isFlagged
    );
    if (blockchainResponse.success) {
      flagSessionInData(patientId, sessionId, isFlagged);
      revalidatePath("/");
      return { success: true, message: `Session ${isFlagged ? "flagged" : "unflagged"}.` };
    } else {
      throw new Error(blockchainResponse.error);
    }
  } catch (error) {
    console.error("Flagging session failed:", error);
    return { success: false, error: "Failed to flag session on the blockchain." };
  }
}

export async function createNewSession(patientId: string, previousSessions: Session[]) {
  try {
    // Simulate new exercise data
    const newExercises: Exercise[] = [
        { name: 'Hand Open/Close', rangeOfMotion: Math.round(Math.random() * 20 + 60), stability: Math.round(Math.random() * 20 + 65), accuracy: Math.round(Math.random() * 20 + 70) },
        { name: 'Wrist Flexion', rangeOfMotion: Math.round(Math.random() * 20 + 50), stability: Math.round(Math.random() * 20 + 60), accuracy: Math.round(Math.random() * 20 + 65) },
        { name: 'Finger Pinch', rangeOfMotion: Math.round(Math.random() * 20 + 55), stability: Math.round(Math.random() * 20 + 60), accuracy: Math.round(Math.random() * 20 + 68) },
    ];
    
    // Calculate new RTS
    const lastRTS = previousSessions[0]?.recoveryTrendScore ?? 60;
    const currentScore = newExercises.reduce((acc, ex) => acc + ex.accuracy + ex.rangeOfMotion + ex.stability, 0) / (newExercises.length * 3);
    const newRTS = Math.round((lastRTS * 0.7) + (currentScore * 0.3));

    // Determine status
    let status: 'Improvement' | 'Stable' | 'Decline';
    if (newRTS > lastRTS + 2) {
      status = 'Improvement';
    } else if (newRTS < lastRTS - 2) {
      status = 'Decline';
    } else {
      status = 'Stable';
    }

    const newSession: Omit<Session, 'blockchain'> & { blockchain: any } = {
        id: `s${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        exercises: newExercises,
        recoveryTrendScore: newRTS,
        status: status,
        isFlagged: false,
        blockchain: null
    };

    const blockchainResponse = await recordSessionOnChain(patientId, newSession);
    
    if (blockchainResponse.success && blockchainResponse.data) {
        const finalSession: Session = {
            ...newSession,
            blockchain: {
                transactionHash: blockchainResponse.data.transactionHash,
                timestamp: blockchainResponse.data.timestamp
            }
        };
        const updatedPatients = addSessionToPatientData(patientId, finalSession);
        revalidatePath('/');
        return { success: true, data: finalSession, patients: updatedPatients };
    } else {
        throw new Error(blockchainResponse.error || 'Unknown blockchain error');
    }

  } catch (error: any) {
    console.error("Creating new session failed:", error);
    return { success: false, error: error.message || "Failed to create new session." };
  }
}

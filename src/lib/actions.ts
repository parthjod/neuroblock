"use server";

import { explainHandMovementQuality } from "@/ai/flows/explain-hand-movement-quality";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { recordSessionOnChain, recordFlagOnChain } from "./blockchain";

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
      await prisma.session.update({
        where: { id: sessionId },
        data: { isFlagged },
      });
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

export async function createNewSession(patientId: string) {
  try {
    const previousSessions = await prisma.session.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const lastRTS = previousSessions[0]?.recoveryTrendScore ?? 60;

    const newExercises = [
      { joint: "Hand Open/Close", score: Math.round(Math.random() * 20 + 60) },
      { joint: "Wrist Flexion", score: Math.round(Math.random() * 20 + 50) },
      { joint: "Finger Pinch", score: Math.round(Math.random() * 20 + 55) },
    ];

    const currentScore = newExercises.reduce((acc, ex) => acc + ex.score, 0) / newExercises.length;
    const newRTS = Math.round((lastRTS * 0.7) + (currentScore * 0.3));

    let status: 'Improvement' | 'Stable' | 'Decline';
    if (newRTS > lastRTS + 2) {
      status = 'Improvement';
    } else if (newRTS < lastRTS - 2) {
      status = 'Decline';
    } else {
      status = 'Stable';
    }

    const newSession = await prisma.session.create({
      data: {
        patientId,
        recoveryTrendScore: newRTS,
        status,
        rts: {
          create: newExercises,
        },
      },
      include: {
        rts: true,
      },
    });

    const blockchainResponse = await recordSessionOnChain(patientId, newSession);
    
    if (blockchainResponse.success && blockchainResponse.data) {
        const finalSession = await prisma.session.update({
            where: { id: newSession.id },
            data: {
                blockchain: {
                    create: {
                        transactionHash: blockchainResponse.data.transactionHash,
                        timestamp: new Date(blockchainResponse.data.timestamp)
                    }
                }
            },
            include: {
                rts: true,
                blockchain: true,
            }
        });

        const patients = await prisma.patient.findMany({
          include: {
            user: true,
            sessions: {
              include: {
                rts: true,
                blockchain: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        });

        revalidatePath('/');
        return { success: true, data: finalSession, patients };
    } else {
        throw new Error(blockchainResponse.error || 'Unknown blockchain error');
    }

  } catch (error: any) {
    console.error("Creating new session failed:", error);
    return { success: false, error: error.message || "Failed to create new session." };
  }
}

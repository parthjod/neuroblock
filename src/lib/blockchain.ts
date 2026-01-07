// This is a mock blockchain service to simulate interactions.
// In a real application, this would interact with a smart contract (e.g., via ethers.js or web3.js).

import type { Session } from '@prisma/client';

const MOCK_LATENCY_MS = 1500;

const mockLedger: any[] = [];

const generateHash = () => '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export const recordSessionOnChain = async (patientId: string, sessionData: Omit<Session, 'blockchain'>) => {
  return new Promise<{ success: boolean; data?: { transactionHash: string; timestamp: number }, error?: string }>((resolve) => {
    setTimeout(() => {
      try {
        const timestamp = Date.now();
        const sessionHash = generateHash(); // This would be a hash of the session data
        const transactionHash = generateHash();
        
        const block = {
          type: 'SESSION_RECORD',
          patientId,
          sessionId: sessionData.id,
          sessionHash,
          recoveryTrendScore: sessionData.recoveryTrendScore,
          timestamp,
          transactionHash,
        };

        mockLedger.push(block);
        console.log('New Block Added (Session):', block);
        
        resolve({ success: true, data: { transactionHash, timestamp } });
      } catch (e) {
        resolve({ success: false, error: 'Failed to write to blockchain.' });
      }
    }, MOCK_LATENCY_MS);
  });
};

export const recordFlagOnChain = async (patientId: string, sessionId: string, isFlagged: boolean) => {
    return new Promise<{ success: boolean; data?: { transactionHash: string; timestamp: number }, error?: string }>((resolve) => {
      setTimeout(() => {
        try {
          const timestamp = Date.now();
          const transactionHash = generateHash();
          
          const block = {
            type: 'FLAG_RECORD',
            patientId,
            sessionId,
            isFlagged,
            timestamp,
            transactionHash,
          };
  
          mockLedger.push(block);
          console.log('New Block Added (Flag):', block);
          
          resolve({ success: true, data: { transactionHash, timestamp } });
        } catch (e) {
          resolve({ success: false, error: 'Failed to write to blockchain.' });
        }
      }, MOCK_LATENCY_MS);
    });
  };

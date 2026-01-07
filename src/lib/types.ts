import { Patient as PrismaPatient, PatientNeurologist, Session as PrismaSession, RTS, Blockchain } from '@prisma/client';

export type PatientWithNeurologists = PrismaPatient & {
  neurologists: PatientNeurologist[];
};

export type SessionWithRelations = PrismaSession & {
  rts: RTS[];
  blockchain: Blockchain[];
  exercises: Array<{
    name: string;
    rangeOfMotion: number;
    stability: number;
    accuracy: number;
  }>;
};

export type Session = {
  id: string;
  date: string;
  exercises: Array<{
    name: string;
    rangeOfMotion: number;
    stability: number;
    accuracy: number;
  }>;
  recoveryTrendScore: number;
  status: 'Improvement' | 'Stable' | 'Decline';
  isFlagged: boolean;
  blockchain?: {
    transactionHash: string;
    timestamp: number;
  };
};

export type PatientWithRelations = PrismaPatient & {
  user: { email: string | null };
  sessions: SessionWithRelations[];
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  condition: string;
  avatarUrl: string;
  sessions: SessionWithRelations[];
  hasPermission: boolean;
};

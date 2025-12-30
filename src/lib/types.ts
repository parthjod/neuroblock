import { Patient as PrismaPatient, PatientNeurologist, Session as PrismaSession, RTS, Blockchain } from '@prisma/client';

export type PatientWithNeurologists = PrismaPatient & {
  neurologists: PatientNeurologist[];
};

export type SessionWithRelations = PrismaSession & {
  rts: RTS[];
  blockchain: Blockchain | null;
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

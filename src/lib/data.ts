import type { Patient } from './types';

let mockPatients: Patient[] = [
  {
    id: 'p001',
    name: 'Alex Johnson',
    age: 58,
    condition: 'Post-Stroke Recovery',
    avatarUrl: 'https://picsum.photos/seed/alex-johnson/100/100',
    hasPermission: true,
    sessions: [
      {
        id: 's001',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: [
          { name: 'Hand Open/Close', rangeOfMotion: 65, stability: 70, accuracy: 75 },
          { name: 'Wrist Flexion', rangeOfMotion: 50, stability: 60, accuracy: 65 },
        ],
        recoveryTrendScore: 65,
        status: 'Stable',
        isFlagged: false,
        blockchain: { transactionHash: '0x' + Math.random().toString(36).substr(2, 62), timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
      },
      {
        id: 's002',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: [
          { name: 'Hand Open/Close', rangeOfMotion: 70, stability: 75, accuracy: 80 },
          { name: 'Wrist Flexion', rangeOfMotion: 55, stability: 68, accuracy: 72 },
          { name: 'Finger Pinch', rangeOfMotion: 60, stability: 70, accuracy: 75 },
        ],
        recoveryTrendScore: 72,
        status: 'Improvement',
        isFlagged: false,
        blockchain: { transactionHash: '0x' + Math.random().toString(36).substr(2, 62), timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      },
      {
        id: 's003',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: [
          { name: 'Hand Open/Close', rangeOfMotion: 68, stability: 72, accuracy: 78 },
          { name: 'Wrist Flexion', rangeOfMotion: 56, stability: 65, accuracy: 70 },
          { name: 'Finger Pinch', rangeOfMotion: 62, stability: 68, accuracy: 73 },
        ],
        recoveryTrendScore: 71,
        status: 'Decline',
        isFlagged: true,
        blockchain: { transactionHash: '0x' + Math.random().toString(36).substr(2, 62), timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
      },
    ],
  },
  {
    id: 'p002',
    name: 'Maria Garcia',
    age: 72,
    condition: 'Arthritis Management',
    avatarUrl: 'https://picsum.photos/seed/maria-garcia/100/100',
    hasPermission: true,
    sessions: [
      {
        id: 's004',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: [
          { name: 'Finger Pinch', rangeOfMotion: 80, stability: 85, accuracy: 88 },
        ],
        recoveryTrendScore: 84,
        status: 'Stable',
        isFlagged: false,
        blockchain: { transactionHash: '0x' + Math.random().toString(36).substr(2, 62), timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
      },
    ],
  },
  {
    id: 'p003',
    name: 'Sam Chen',
    age: 45,
    condition: 'Carpal Tunnel Syndrome',
    avatarUrl: 'https://picsum.photos/seed/sam-chen/100/100',
    hasPermission: false,
    sessions: [],
  },
];

export const getPatients = (): Patient[] => {
  return JSON.parse(JSON.stringify(mockPatients));
};

export const getPatientById = (id: string): Patient | undefined => {
  return JSON.parse(JSON.stringify(mockPatients.find(p => p.id === id)));
};

export const addSessionToPatient = (patientId: string, session: Patient['sessions'][0]): Patient[] => {
  const patientIndex = mockPatients.findIndex(p => p.id === patientId);
  if (patientIndex !== -1) {
    mockPatients[patientIndex].sessions.push(session);
    mockPatients[patientIndex].sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return getPatients();
};

export const flagSession = (patientId: string, sessionId: string, isFlagged: boolean): Patient[] => {
    const patientIndex = mockPatients.findIndex(p => p.id === patientId);
    if(patientIndex !== -1) {
        const sessionIndex = mockPatients[patientIndex].sessions.findIndex(s => s.id === sessionId);
        if(sessionIndex !== -1) {
            mockPatients[patientIndex].sessions[sessionIndex].isFlagged = isFlagged;
        }
    }
    return getPatients();
}

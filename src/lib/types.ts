export type Exercise = {
  name: 'Hand Open/Close' | 'Wrist Flexion' | 'Finger Pinch';
  rangeOfMotion: number;
  stability: number;
  accuracy: number;
};

export type Session = {
  id: string;
  date: string;
  exercises: Exercise[];
  recoveryTrendScore: number;
  status: 'Improvement' | 'Stable' | 'Decline';
  isFlagged: boolean;
  blockchain: {
    transactionHash: string;
    timestamp: number;
  } | null;
  aiAnalysis?: {
    clinicalExplanation: string;
    recommendations: string;
  };
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  condition: string;
  avatarUrl: string;
  sessions: Session[];
  hasPermission: boolean;
};

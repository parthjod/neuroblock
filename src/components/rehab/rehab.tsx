'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Session, RTS } from '@prisma/client';

interface RehabProps {
  session: Session & { rts: RTS[] };
}

export function Rehab({ session }: RehabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rehabilitation Session</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Session ID: {session.id}</p>
        <p>Patient ID: {session.patientId}</p>
        <p>Started At: {new Date(session.createdAt).toLocaleString()}</p>

        <div className="mt-4">
          <h3 className="font-bold">Real-Time Scoring (RTS)</h3>
          <ul>
            {session.rts.map((rtsItem) => (
              <li key={rtsItem.id}>
                {rtsItem.joint}: {rtsItem.score}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

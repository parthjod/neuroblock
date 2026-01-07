import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const { patientId } = await req.json();

  if (!patientId) {
    return NextResponse.json(
      { error: 'Patient ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await prisma.session.create({
      data: {
        patientId,
        recoveryTrendScore: 50,
        status: 'Stable',
        rts: {
          create: [
            { joint: 'Ankle', score: 0 },
            { joint: 'Knee', score: 0 },
            { joint: 'Hip', score: 0 },
            { joint: 'Wrist', score: 0 },
            { joint: 'Elbow', score: 0 },
            { joint: 'Shoulder', score: 0 },
          ],
        },
      },
      include: {
        rts: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface NeurologistPatientsParams {
  id: string;
}

export async function GET(
  req: Request,
  { params }: { params: NeurologistPatientsParams }
) {
  const neurologist = await prisma.neurologist.findUnique({
    where: { userId: params.id },
    include: {
      patients: {
        where: {
          patient: {
            visibility: true,
          },
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!neurologist) {
    return NextResponse.json({ error: 'Neurologist not found' }, { status: 404 });
  }

  const patients = neurologist.patients.map((p: typeof neurologist.patients[number]) => ({
    id: p.patient.user.id,
    name: p.patient.user.email, // Or a name field if you add it
    age: 0, // Replace with actual data
    condition: '', // Replace with actual data
    avatarUrl: '', // Replace with actual data
    sessions: [], // Replace with actual data
    hasPermission: true,
  }));

  return NextResponse.json(patients);
}

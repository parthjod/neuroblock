import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const patient = await prisma.patient.findUnique({
    where: { userId: params.id },
    include: {
      neurologists: true,
    },
  });

  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  return NextResponse.json(patient);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { details, visibility, neurologistIds } = await req.json();

  const patient = await prisma.patient.update({
    where: { userId: params.id },
    data: {
      details,
      visibility,
      neurologists: {
        deleteMany: {},
        create: neurologistIds.map((id: string) => ({
          neurologistId: id,
        })),
      },
    },
  });

  return NextResponse.json(patient);
}

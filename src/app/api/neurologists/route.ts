import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const neurologists = await prisma.neurologist.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  return NextResponse.json(neurologists);
}

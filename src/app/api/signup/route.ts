import { NextResponse } from 'next/server';
import { signup } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: 'Email, password, and role are required' },
      { status: 400 }
    );
  }

  if (role !== 'PATIENT' && role !== 'NEUROLOGIST') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  try {
    await signup(email, password, role as Role);
    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    );
  }
}

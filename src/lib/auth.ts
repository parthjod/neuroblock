import { prisma } from './db';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export async function signup(email: string, password: string, role: Role) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user and either a patient or neurologist record
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      ...(role === 'PATIENT'
        ? { patient: { create: {} } }
        : { neurologist: { create: {} } }),
    },
    include: {
      patient: true,
      neurologist: true,
    },
  });

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid password');
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        try {
          const user = await login(credentials.email, credentials.password);
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

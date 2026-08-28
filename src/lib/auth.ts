import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { LoginSchema } from '@/lib/schemas'
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id?: string 
    role?: 'USER' | 'ADMIN'
  }
  interface Session {
    user: {
      id: string
      role: 'USER' | 'ADMIN'
    } & import("next-auth").DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: 'USER' | 'ADMIN'
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        

        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.error("❌ ОШИБКА ВАЛИДАЦИИ ZOD В NEXTAUTH:", validatedFields.error.flatten());
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.password) {
          console.error("❌ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН В БД");
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          console.error("❌ ПАРОЛИ НЕ СОВПАЛИ");
          return null;
        }

        console.log("✅ УСПЕШНАЯ АВТОРИЗАЦИЯ:", user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'USER' | 'ADMIN',
          rememberMe: validatedFields.data.rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as 'USER' | 'ADMIN'
        token.name = user.name
      }

      const currentSession = session as Record<string, unknown> | null | undefined;
      if (trigger === "update" && currentSession?.name) {
        token.name = currentSession.name as string;
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/error'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60,   
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, 
      },
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

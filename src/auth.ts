import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[auth] Validation failed:", parsed.error.issues);
            return null;
          }

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) {
            console.error("[auth] User not found or no password:", email);
            return null;
          }

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) {
            console.error("[auth] Password mismatch for:", email);
            return null;
          }

          console.log("[auth] Login successful for:", email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("[auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

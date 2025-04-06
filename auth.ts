import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Conservar el proveedor de inicio de sesión en el token
      if (account) {
        token.provider = account.provider;
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // También puedes añadir el proveedor a la sesión si lo necesitas
        (session as any).provider = token.provider;
      }
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isRegistering: { label: "Is Registering", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          // Para demostración, si el usuario no existe y estamos en el register flow, lo creamos
          // Esto debería manejarse en una ruta /api/register en una aplicación real
          if (credentials.isRegistering === "true") {
            const hashedPassword = await hash(credentials.password, 10);
            
            const newUser = await db.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || null,
                hashedPassword
              }
            });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            };
          }
          
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
};

// Crear una instancia de NextAuth con los options
const handler = NextAuth(authOptions);

// Exportar los handlers
export { handler as GET, handler as POST };

// Exportar las funciones de utilidad
export const { auth, signIn, signOut } = NextAuth(authOptions); 
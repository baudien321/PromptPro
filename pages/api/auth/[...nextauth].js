import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, createUser } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth-utils";

// For more information on NextAuth.js configuration options, see:
// https://next-auth.js.org/configuration/options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          const user = getUserByEmail(credentials.email);
          
          if (!user || !user.password) {
            return null;
          }
          
          const isValid = await verifyPassword(credentials.password, user.password);
          
          if (!isValid) {
            return null;
          }
          
          // Don't return the password
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      }
    })
  ],
  // Database is optional - NextAuth.js can work without a database
  // using JSON Web Tokens stored in secure cookies
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only create a user for OAuth providers, not credentials
      if (account && account.provider === "google") {
        try {
          // Check if user exists
          const existingUser = getUserByEmail(profile.email);
          
          if (!existingUser) {
            // Create a new user
            await createUser({
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              // Note: no password for OAuth users
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          // Still return true to allow signin
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token for a connected account
      session.user.id = token.id || token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup", // Custom sign up page
  },
};

export default NextAuth(authOptions);
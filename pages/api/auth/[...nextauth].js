import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// For more information on NextAuth.js configuration options, see:
// https://next-auth.js.org/configuration/options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Database is optional - NextAuth.js can work without a database
  // using JSON Web Tokens stored in secure cookies
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client, like an access_token for a connected account
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
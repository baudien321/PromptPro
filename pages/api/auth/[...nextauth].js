import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../../models/user';
import Team from '../../../models/team';
import connectDB from '../../../lib/mongoose';

// --- Mongoose Connection Helper (Copied from register.js - consider moving to shared lib/mongoose.js) ---
/*
let connectionPromise = null;
const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }
  if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'PromptPro',
      useNewUrlParser: true,
      useUnifiedTopology: true,
  }).then((mongooseInstance) => {
      console.log("Mongoose connected successfully (NextAuth).");
      return mongooseInstance;
  }).catch(err => {
      console.error("Mongoose connection error (NextAuth):", err);
      connectionPromise = null; 
      throw err; 
  });
  return connectionPromise;
};
*/
// --- End Connection Helper ---

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
        login: { label: "Username or Email", type: "text", placeholder: "jsmith / jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          console.log('Authorize: Missing credentials');
          return null;
        }

        try {
          await connectDB();
          console.log(`Authorize: Attempting login for: ${credentials.login}`);

          const user = await User.findOne({
            $or: [
              { email: credentials.login.toLowerCase() },
              { username: credentials.login }
            ]
          }).select('+password');

          if (!user) {
            console.log(`Authorize: User not found: ${credentials.login}`);
            return null;
          }

          if (!user.password) {
              console.log(`Authorize: User found but password hash missing: ${credentials.login}`);
              return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.log(`Authorize: Invalid password for: ${credentials.login}`);
            return null;
          }

          console.log(`Authorize: Login successful for: ${credentials.login}`);
          return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              username: user.username,
              role: user.role,
              image: user.image
          };

        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider === "google") {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: profile.email });

          if (!dbUser) {
            console.log(`SignIn Callback: Creating new Google user: ${profile.email}`);
            dbUser = await User.create({
              name: profile.name,
              email: profile.email,
              username: profile.email,
              image: profile.picture,
            });
          } else {
              console.log(`SignIn Callback: Existing Google user found: ${profile.email}`);
              if (profile.picture && dbUser.image !== profile.picture) {
                  dbUser.image = profile.picture;
                  await dbUser.save();
              }
          }
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.username = dbUser.username;

        } catch (error) {
          console.error("Error in signIn callback (Google):", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.userId && session.user) {
        session.user.id = token.userId;
        session.user.username = token.username;

        try {
          await connectDB();
          const dbUser = await User.findById(token.userId)
                             .select('hasCompletedOnboarding image plan promptCount name email role')
                             .lean();

          if (dbUser) {
            session.user.hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
            session.user.image = dbUser.image || session.user.image;
            session.user.plan = dbUser.plan;
            session.user.promptCount = dbUser.promptCount;
            session.user.name = dbUser.name || session.user.name;
            session.user.email = dbUser.email || session.user.email;
            session.user.role = dbUser.role;

            const teams = await Team.find({ 'members.user': token.userId })
                                  .select('name members.$')
                                  .lean();

            session.user.teamMemberships = teams.map(team => ({
              teamId: team._id.toString(),
              teamName: team.name,
              role: team.members[0].role
            }));

          } else {
            console.error(`Session Callback: User not found in DB for token userId: ${token.userId}`);
            session.user = { id: token.userId };
          }
        } catch (error) {
           if (error instanceof mongoose.Error.CastError && error.path === '_id') {
             console.error(`Session Callback: Invalid ObjectId format used for user lookup: ${token.userId}`, error.message);
             session.user = { id: token.userId };
           } else {
             console.error("Session Callback: Error fetching user/team data from DB:", error);
             if (session.user) {
                 session.user.teamMemberships = [];
             }
           }
        }
      } else {
        if (!token?.userId) console.warn("Session Callback: token.userId is missing.");
        if (!session.user) console.warn("Session Callback: session.user is missing.");
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
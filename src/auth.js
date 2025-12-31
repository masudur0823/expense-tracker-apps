import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { dbConnect } from "./dbConfig/dbConfig";
import { authConfig } from "./auth.config";
import User from "./model/user-model";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      csrf: false,
      async authorize(credentials) {
        if (!credentials) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");

        if (!user.isActive) {
          throw new Error("Your account is inactive. Please contact support.");
        }
        // if (!user.isVerified) {
        //   throw new Error(
        //     JSON.stringify({
        //       message: "Your account is not verified yet.",
        //       type: "not_verified",
        //     })
        //   );
        // }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) throw new Error("Email or Password is not correct");

        return user;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});

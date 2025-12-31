import User from "./model/user-model";
import { dbConnect } from "./dbConfig/dbConfig";

export const authConfig = {
  session: { strategy: "jwt" },
  // providers: [],
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      // On first login, store user id + timestamp
      if (user) {
        token.id = user._id.toString();
        token.name = user.name;
        token.userImg = user.userImg || "";
        token.email = user.email;
        token.role = user.role;
        token.phone = user.phone || "";
        token.university = user.university || "";
        token.occupation = user.occupation || "";
        token.isActive = user.isActive || false;
        token.isVerified = user.isVerified || false;
        token.isForumAbandon = user.isForumAbandon || false;
        token.lastUpdated = Date.now(); // store last DB sync time
      }
      return token;
    },

    async session({ session, token }) {
      const now = Date.now();
      const needsUpdate = !token.lastUpdated || now - token.lastUpdated > 60000; // 60s

      if (needsUpdate) {
        await dbConnect();
        const dbUser = await User.findById(token.id);

        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.name = dbUser.name;
          session.user.userImg = dbUser.userImg || "";
          session.user.email = dbUser.email;
          session.user.role = dbUser.role;
          session.user.phone = dbUser.phone || "";
          session.user.university = dbUser.university || "";
          session.user.occupation = dbUser.occupation || "";
          session.user.isActive = dbUser.isActive || false;
          session.user.isVerified = dbUser.isVerified || false;
          session.user.isForumAbandon = dbUser.isForumAbandon || false;

          // update token for next session call
          token.name = dbUser.name;
          token.userImg = dbUser.userImg || "";
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.phone = dbUser.phone || "";
          token.university = dbUser.university || "";
          token.occupation = dbUser.occupation || "";
          token.isActive = dbUser.isActive || false;
          token.isVerified = dbUser.isVerified || false;
          token.isForumAbandon = dbUser.isForumAbandon || false;
          token.lastUpdated = now;
        }
      } else {
        // Use cached token data
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.userImg = token.userImg || "";
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.phone = token.phone || "";
        session.user.university = token.university || "";
        session.user.occupation = token.occupation || "";
        session.user.isActive = token.isActive || false;
        session.user.isVerified = token.isVerified || false;
        session.user.isForumAbandon = token.isForumAbandon || false;
      }

      return session;
    },
  },
};

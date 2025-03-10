import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Configuration object that will be passed to NextAuth
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Get credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        // Check if environment variables are set
        if (!adminUsername || !adminPassword) {
          console.error("Admin credentials are not set in environment variables");
          return null;
        }
        
        // Verify the credentials
        if (
          credentials.username === adminUsername &&
          credentials.password === adminPassword
        ) {
          // Return a user object if credentials are valid
          return {
            id: "1",
            name: "Admin",
            email: "admin@example.com"
          };
        }
        
        // Return null if credentials are invalid
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the JWT token when it's created
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to the session
      if (token) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
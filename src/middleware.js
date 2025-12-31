import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const secret = process.env.AUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret });

  // If no token, redirect to login //
   ////////////////////////////////////////////////////
  // if (!token) {
  //   return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  // }
 ////////////////////////////////////////////////////
  // If user is inactive, force logout //
   ////////////////////////////////////////////////////
  // if (!token.isActive) {
  //   const response = NextResponse.redirect(new URL("/login", req.url));

  //   // Clear session cookies (NextAuth default cookie names)
  //   response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
  //   response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0 });
  //   response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });

  //   return response;
  // }
  ////////////////////////////////////////////////////

  // If not admin, block dashboard
  // if (token.role !== "Admin") {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

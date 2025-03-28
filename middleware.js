import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(req) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect routes that require authentication
  const protectedRoutes = [
    '/prompts/create',
    '/prompts/edit',
  ];

  // Check if the pathname starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route and the user is not authenticated,
  // redirect to the sign-in page
  if (isProtectedRoute && !session) {
    const url = new URL('/auth/signin', req.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/prompts/create',
    '/prompts/edit/:path*',
  ],
};
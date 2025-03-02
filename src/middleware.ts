import { NextResponse } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const auth = getAuth(req);
  
  // Allow access to public routes
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
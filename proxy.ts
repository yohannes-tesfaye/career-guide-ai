import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
    const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/jobs") ||
        request.nextUrl.pathname.startsWith("/skill-gap") ||
        request.nextUrl.pathname.startsWith("/resume") ||
        request.nextUrl.pathname.startsWith("/learning-path") ||
        request.nextUrl.pathname.startsWith("/learning-resources");

    if(!session) {
        if (isProtectedRoute || isOnboardingRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // User is authenticated
    if (!session.user.isOnboarded) {
        if (!isOnboardingRoute && !isAuthRoute) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }
    } else {
        if (isOnboardingRoute || isAuthRoute) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/skill-gap",
    "/resume",
    "/learning-path/:path*",
    "/learning-resources/:path*",
    "/onboarding",
    "/login",
    "/signup",
  ],
};
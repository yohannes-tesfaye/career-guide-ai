import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
    const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

    if(!session) {
        if (isDashboardRoute || isOnboardingRoute) {
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
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup"],
};
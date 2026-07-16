import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  hasValidDemoSession,
  isApiPath,
  isPublicApiPath,
  isPublicAppPath,
} from "@/lib/demo-mode/auth";
import {
  isApiAllowed,
  isAuthRequired,
  isDemoMode,
  isRouteAllowed,
  normalizePathname,
} from "@/lib/demo-mode/profile";

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  if (pathname !== "/") {
    loginUrl.searchParams.set("redirect", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

function redirectToNotInDemo(request: NextRequest) {
  const notInDemoUrl = request.nextUrl.clone();
  notInDemoUrl.pathname = "/not-in-demo";
  notInDemoUrl.search = "";
  return NextResponse.redirect(notInDemoUrl);
}

function continueWithPathname(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", normalizePathname(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = normalizePathname(pathname);

  if (isPublicAppPath(path) || (isApiPath(path) && isPublicApiPath(path))) {
    return continueWithPathname(request);
  }

  // Auth gate runs before route allowlist.
  if (isAuthRequired() && !(await hasValidDemoSession(request))) {
    if (isApiPath(path)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return redirectToLogin(request, pathname);
  }

  if (isDemoMode() && isApiPath(path) && !isApiAllowed(path)) {
    return NextResponse.json(
      { error: "Not available in Demo Mode" },
      { status: 403 },
    );
  }

  if (isDemoMode() && !isApiPath(path) && !isRouteAllowed(path)) {
    return redirectToNotInDemo(request);
  }

  return continueWithPathname(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

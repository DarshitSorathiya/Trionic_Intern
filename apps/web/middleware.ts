import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run the intl middleware first
  const response = intlMiddleware(request);

  // 2. Fallback check to safely bypass middleware if Supabase env vars are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing. Bypassing authentication middleware.');
    return response;
  }
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Auth redirects (protected routes check)
  const pathname = request.nextUrl.pathname;
  
  // We can strip the locale prefix to get the clean pathname (e.g. '/dashboard')
  const localePrefixRegex = /^\/(en|hi|gu|mr|ta)(\/|$)/;
  const cleanPathname = pathname.replace(localePrefixRegex, "/");

  // Determine if it's a public path
  const isPublicPath =
    cleanPathname === "/" ||
    cleanPathname.startsWith("/auth/") ||
    cleanPathname.startsWith("/api/") || // let API routes handle their own auth
    pathname.startsWith("/_next") ||
    pathname.includes("."); // static assets

  // Demo-mode escape hatch: set NEXT_PUBLIC_DEMO_MODE=true to skip the auth
  // redirect (lets the frontend lead preview the UI without credentials).
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!demoMode && !user && !isPublicPath) {
    // Redirect to sign-in page, preserving the locale!
    const match = pathname.match(localePrefixRegex);
    const locale = match ? match[1] : "en";

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/sign-in`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Match the root
    "/",
    // Match all localized path prefixes
    "/(en|hi|gu|mr|ta)/:path*",
    // Exclude Next.js internals, static assets (images, fonts, favicon), and API routes
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

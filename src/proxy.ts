import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { buildAuthRedirectUrl } from "@/lib/auth/return-url";
import {
  requiresAuthenticatedUser,
  requiresOrganizationMembership,
} from "@/lib/auth/route-guards";
import { getSupabasePublicEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function applyCookies(response: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const pathname = requestUrl.pathname;

  if (!requiresAuthenticatedUser(pathname)) {
    return NextResponse.next();
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const cookiesToSet: CookieToSet[] = [];
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(newCookies) {
        newCookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookiesToSet.push({ name, value, options });
        });

        response = applyCookies(NextResponse.next({ request }), cookiesToSet);
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const redirect = NextResponse.redirect(buildAuthRedirectUrl(requestUrl));
    return applyCookies(redirect, cookiesToSet);
  }

  if (requiresOrganizationMembership(pathname)) {
    const { data: memberships, error: membershipsError } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (membershipsError || !memberships || memberships.length === 0) {
      const redirect = NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      return applyCookies(redirect, cookiesToSet);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizer/:path*"],
};

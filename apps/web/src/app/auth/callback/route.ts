import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth callback by exchanging an authorization code for a session and redirecting the client.
 *
 * @param request - Incoming request containing the callback query parameters (`code` and optional `next`)
 * @returns A redirect response to the original request origin combined with the `next` path on successful exchange; otherwise a redirect to the origin's `/login?error=auth_callback_error` page
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
"use client";

import { createClient } from "@/lib/supabase/client";
import { DecorativeBlob, DecorativeDots } from "@/components/decorative-blob";
import { OurNestLogo } from "@/components/ournest-logo";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="bg-cream-bg min-h-screen flex items-center justify-center p-6 selection:bg-pastel-peach">
      {/* Background decorations */}
      <div className="fixed top-10 right-10 -z-10 text-pastel-peach/40 transform rotate-12">
        <span className="material-symbols-outlined text-[120px]">cloud</span>
      </div>
      <div className="fixed bottom-10 left-10 -z-10 text-pastel-mint/30 transform -rotate-6">
        <span className="material-symbols-outlined filled text-[180px]">
          eco
        </span>
      </div>

      {/* Main card */}
      <main className="bg-white w-full max-w-5xl min-h-[600px] rounded-3xl shadow-2xl shadow-charcoal-text/5 overflow-hidden flex flex-col md:flex-row">
        {/* Left panel - Branding */}
        <div className="w-full md:w-5/12 relative bg-gradient-to-br from-pastel-peach/40 to-cream-bg flex flex-col items-center justify-center p-12 overflow-hidden">
          <DecorativeBlob variant="mint" size="lg" position="top-left" />
          <DecorativeBlob
            variant="lavender"
            size="md"
            position="bottom-right"
          />

          {/* Icon circle */}
          <div className="relative z-10 transform transition-transform duration-700 hover:scale-105">
            <div className="w-72 h-72 md:w-80 md:h-80 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg shadow-pastel-peach/50 relative">
              <DecorativeDots />
              <span className="material-symbols-outlined text-[120px] md:text-[140px] text-charcoal-text/80 drop-shadow-sm">
                cottage
              </span>
            </div>
          </div>

          {/* Branding text */}
          <div className="relative z-10 mt-10 text-center">
            <h2 className="text-2xl font-bold text-charcoal-text mb-2">
              OurNest
            </h2>
            <p className="text-sm text-charcoal-text/60 font-medium max-w-[200px] mx-auto leading-relaxed">
              Track expenses together and find financial harmony.
            </p>
          </div>
        </div>

        {/* Right panel - Login form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            {/* App badge */}
            <div className="mb-12">
              <OurNestLogo size="sm" />
            </div>

            {/* Welcome text */}
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-charcoal-text mb-3">
                Welcome Back.
              </h1>
              <p className="text-light-grey-text text-lg font-light">
                Sign in to manage your household budget.
              </p>
            </div>

            {/* Google login button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white border border-charcoal-text/10 hover:border-charcoal-text/30 hover:bg-gray-50 text-charcoal-text font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-pastel-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-base">Log in with Google</span>
            </button>

            {/* Terms footer */}
            <div className="mt-12 text-center flex flex-col gap-4">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-charcoal-text/10 to-transparent" />
              <p className="text-xs text-light-grey-text font-medium">
                By logging in, you agree to our{" "}
                <a
                  className="text-charcoal-text/70 hover:text-charcoal-text underline decoration-pastel-peach underline-offset-2"
                  href="#"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  className="text-charcoal-text/70 hover:text-charcoal-text underline decoration-pastel-peach underline-offset-2"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

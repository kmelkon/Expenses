import { useCallback, useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { supabase } from "../db/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_SCOPES = ["openid", "email", "profile"];
const REDIRECT_OPTIONS = {
  scheme: "expenses",
  path: "auth/callback",
};

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

if (!webClientId || !iosClientId || !androidClientId) {
  throw new Error("Google OAuth client IDs are not configured.");
}

export function useGoogleSignIn() {
  const setAuthError = useAuthStore((state) => state.setError);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectOptions = useMemo(() => REDIRECT_OPTIONS, []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: webClientId,
      iosClientId,
      androidClientId,
      scopes: GOOGLE_SCOPES,
      responseType: ResponseType.IdToken,
      usePKCE: false,
    },
    redirectOptions
  );

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "success") {
      const idToken = response.params.id_token;

      if (!idToken) {
        const message = "Missing Google ID token.";
        setError(message);
        setIsLoading(false);
        setAuthError(message);
        return;
      }

      const signIn = async () => {
        const { error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
          nonce: request?.nonce,
        });

        if (signInError) {
          const message =
            signInError.message || "Unable to sign in with Supabase.";
          setError(message);
          setAuthError(message);
        } else {
          setError(null);
        }

        setIsLoading(false);
      };

      void signIn();
      return;
    }

    if (response.type === "error") {
      const message =
        response.error?.message ||
        response.params.error_description ||
        "Google sign-in failed. Please try again.";
      setError(message);
      setAuthError(message);
      setIsLoading(false);
      return;
    }

    if (response.type === "cancel" || response.type === "dismiss") {
      setIsLoading(false);
    }
  }, [response, request?.nonce, setAuthError]);

  const signIn = useCallback(async () => {
    if (!request) {
      const message = "Google sign-in is not ready yet.";
      setError(message);
      setAuthError(message);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await promptAsync();
    } catch (promptError) {
      const message =
        promptError instanceof Error
          ? promptError.message
          : "Unable to open Google sign-in.";
      setError(message);
      setAuthError(message);
      setIsLoading(false);
    }
  }, [promptAsync, request, setAuthError]);

  return {
    isReady: Boolean(request),
    isLoading,
    error,
    signIn,
  };
}

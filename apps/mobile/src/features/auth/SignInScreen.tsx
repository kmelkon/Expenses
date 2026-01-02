import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleSignIn } from "../../lib/useGoogleSignIn";
import { Theme, useTheme } from "../../theme";

/**
 * Renders the sign-in screen with a Google authentication button and optional error display.
 *
 * Shows a centered card containing a title, subtitle, and a "Continue with Google" button.
 * The button is disabled while the sign-in flow is not ready or when a sign-in is in progress;
 * it displays a spinner during loading and the Google logo otherwise. Any authentication
 * error returned by the sign-in hook is rendered below the button.
 *
 * @returns The React element for the sign-in screen.
 */
export function SignInScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { signIn, isLoading, isReady, error } = useGoogleSignIn();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in to Expenses</Text>
        <Text style={styles.subtitle}>
          Connect your Google account to continue.
        </Text>

        <TouchableOpacity
          style={[styles.button, !isReady && styles.buttonDisabled]}
          onPress={signIn}
          activeOpacity={0.8}
          disabled={!isReady || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    title: {
      ...theme.typography.headingLg,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.body,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.textMuted,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1A73E8",
      paddingVertical: theme.spacing.md,
      borderRadius: 999,
      gap: theme.spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      textAlign: "center",
      marginTop: theme.spacing.lg,
    },
  });
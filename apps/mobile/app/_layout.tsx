import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SignInScreen } from "../src/features/auth/SignInScreen";
import { getDB } from "../src/db/sqlite";
import { useAppearanceStore } from "../src/store/useAppearanceStore";
import { useAuthStore } from "../src/store/useAuthStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { ThemeProvider, useTheme } from "../src/theme";

export default function RootLayout() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadThemePreference = useAppearanceStore(
    (state) => state.loadThemePreference
  );
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      await getDB();

      await Promise.all([
        loadSettings(),
        loadThemePreference(),
        initializeAuth(),
      ]);
    };

    initializeApp().catch(console.error);
  }, [initializeAuth, loadSettings, loadThemePreference]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const theme = useTheme();
  const session = useAuthStore((state) => state.session);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          style={theme.statusBarStyle}
          backgroundColor={theme.colors.headerBackground}
        />
        <SignInScreen />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.colors.headerBackground}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.headerBackground,
          },
          headerTintColor: theme.colors.headerTint,
          headerTitleStyle: {
            ...theme.typography.headingSm,
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {/* Tabs Group - Home and Settings */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false, // Tabs will manage their own headers
          }}
        />
        <Stack.Screen
          name="auth/index"
          options={{
            headerShown: false,
          }}
        />

        {/* Modal Screens */}
        <Stack.Screen
          name="add"
          options={{
            title: "Add Expense",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{
            title: "Edit Expense",
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

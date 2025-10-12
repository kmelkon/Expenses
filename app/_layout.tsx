import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getDB } from "../src/db/sqlite";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useAppearanceStore } from "../src/store/useAppearanceStore";
import { ThemeProvider, useTheme } from "../src/theme";

export default function RootLayout() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadThemePreference = useAppearanceStore(
    (state) => state.loadThemePreference
  );

  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      await getDB();

      await Promise.all([loadSettings(), loadThemePreference()]);
    };

    initializeApp().catch(console.error);
  }, [loadSettings, loadThemePreference]);

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

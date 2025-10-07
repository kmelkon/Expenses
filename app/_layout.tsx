import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getDB } from "../src/db/sqlite";
import { useSettingsStore } from "../src/store/useSettingsStore";

export default function RootLayout() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      await getDB();

      // Load categories and payers into the settings store
      await loadSettings();
    };

    initializeApp().catch(console.error);
  }, [loadSettings]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#007AFF",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "600",
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
    </GestureHandlerRootView>
  );
}

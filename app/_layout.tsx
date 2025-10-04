import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getDB } from "../src/db/sqlite";

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      const db = await getDB();

      // Only seed in development when explicitly enabled
      if (__DEV__ && process.env.EXPO_PUBLIC_SEED === "1") {
        const { seed } = await import("../src/dev/seed");
        await seed(db);
      }
    };

    initializeApp().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
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
        <Stack.Screen
          name="index"
          options={{
            title: "Expenses",
          }}
        />
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
    </GestureHandlerRootView>
  );
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { openDB } from "../src/db/sqlite";

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      const db = await openDB();

      // Only seed in development when explicitly enabled
      if (__DEV__ && process.env.EXPO_PUBLIC_SEED === "1") {
        const { seed } = await import("../src/dev/seed");
        await seed(db);
      }
    };

    initializeApp().catch(console.error);
  }, []);

  return (
    <>
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
      </Stack>
    </>
  );
}

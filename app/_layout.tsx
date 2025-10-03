import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { openDB } from "../src/db/sqlite";
import { seedTestData } from "../src/utils/seedData";

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      await openDB();
      await seedTestData(); // Seed test data in development
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

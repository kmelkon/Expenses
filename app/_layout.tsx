import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomNav from "../src/components/BottomNav";
import { getDB } from "../src/db/sqlite";

export default function RootLayout() {
  const pathname = usePathname();

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

  // Hide bottom nav on add and edit modals
  const shouldShowBottomNav =
    !pathname.startsWith("/add") && !pathname.startsWith("/edit");

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
        {shouldShowBottomNav && <BottomNav />}
      </View>
    </GestureHandlerRootView>
  );
}

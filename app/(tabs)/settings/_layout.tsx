import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
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
          title: "Settings",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: "About",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: "Manage Categories",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payers"
        options={{
          title: "Manage Payers",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="data-management"
        options={{
          title: "Data Management",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="developer"
        options={{
          title: "Developer Tools",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

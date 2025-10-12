import { Stack } from "expo-router";
import { useTheme } from "../../../src/theme";

export default function SettingsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.headerTint,
        headerTitleStyle: {
          ...theme.typography.headingSm,
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

import { Tabs } from "expo-router";
import { useTheme } from "../../src/theme";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Let each tab manage its own header
        tabBarStyle: { display: "none" }, // Hide default tab bar - we use custom BottomNav
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.headerTint,
        headerTitleStyle: {
          ...theme.typography.headingSm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Expenses",
          headerShown: true, // Show header for Home screen
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}

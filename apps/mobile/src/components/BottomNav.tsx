import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Theme, useTheme } from "../theme";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Check if we're on a specific tab (handles both / and /(tabs) patterns)
  const isHomeActive = pathname === "/" || pathname === "/(tabs)";
  const isSettingsActive =
    pathname === "/settings" || pathname === "/(tabs)/settings";

  const handleHomePress = () => {
    // Only navigate if not already on home
    if (!isHomeActive) {
      router.navigate("/(tabs)");
    }
  };

  const handleAddPress = () => {
    // Always allow navigation to add modal
    router.push("/add");
  };

  const handleSettingsPress = () => {
    // Only navigate if not already on settings
    if (!isSettingsActive) {
      router.navigate("/(tabs)/settings");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
      ]}
    >
      {/* Home/Expenses Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={handleHomePress}
        activeOpacity={0.7}
        disabled={isHomeActive} // Disable button when on home tab
      >
        <Ionicons
          name={isHomeActive ? "home" : "home-outline"}
          size={24}
          color={isHomeActive ? theme.colors.accent : theme.colors.textSecondary}
        />
        <Text style={[styles.label, isHomeActive && styles.activeLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Add Expense Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={handleAddPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.addButton,
            pathname === "/add" && styles.addButtonActive,
          ]}
        >
          <Ionicons
            name="add"
            size={28}
            color={theme.colors.accentOn}
          />
        </View>
        <Text style={styles.label}>Add</Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={handleSettingsPress}
        activeOpacity={0.7}
        disabled={isSettingsActive} // Disable button when on settings tab
      >
        <Ionicons
          name={isSettingsActive ? "settings" : "settings-outline"}
          size={24}
          color={
            isSettingsActive ? theme.colors.accent : theme.colors.textSecondary
          }
        />
        <Text style={[styles.label, isSettingsActive && styles.activeLabel]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.navBackground,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.navBorder,
      paddingBottom: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 8,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
    },
    label: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },
    activeLabel: {
      color: theme.colors.accent,
      fontWeight: "600",
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    addButtonActive: {
      backgroundColor: theme.colors.accentStrong,
    },
  });

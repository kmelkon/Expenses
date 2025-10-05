import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Check if we're on a specific tab (handles both / and /(tabs) patterns)
  const isHomeActive = pathname === "/" || pathname === "/(tabs)";
  const isSettingsActive =
    pathname === "/settings" || pathname === "/(tabs)/settings";

  const handleHomePress = () => {
    // Only navigate if not already on home
    if (!isHomeActive) {
      router.navigate("/(tabs)/");
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
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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
          color={isHomeActive ? "#007AFF" : "#666"}
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
          <Ionicons name="add" size={28} color="white" />
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
          color={isSettingsActive ? "#007AFF" : "#666"}
        />
        <Text style={[styles.label, isSettingsActive && styles.activeLabel]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#007AFF",
    fontWeight: "600",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  addButtonActive: {
    backgroundColor: "#0051D5",
  },
});

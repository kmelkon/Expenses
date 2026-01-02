import Constants from "expo-constants";
import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme, useTheme } from "../../../src/theme";

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version ?? "0.0.1";
  const platform = Platform.OS === "ios" ? "iOS" : "Android";
  const isDev = __DEV__;
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>{platform}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Environment</Text>
          <Text style={styles.infoValue}>
            {isDev ? "Development" : "Production"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      ...theme.typography.headingMd,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
  });

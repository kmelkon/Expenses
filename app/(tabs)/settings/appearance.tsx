import { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Theme,
  useSetThemePreference,
  useTheme,
  useThemePreference,
} from "../../../src/theme";
import type { ThemePreference } from "../../../src/store/useAppearanceStore";

type ThemeOption = {
  label: string;
  description: string;
  value: ThemePreference;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    label: "Follow System",
    description: "Match your device settings and switch automatically.",
    value: "system",
  },
  {
    label: "Light",
    description: "Use the light theme, even if the system is in dark mode.",
    value: "light",
  },
  {
    label: "Dark",
    description: "Use the dark theme, even if the system is in light mode.",
    value: "dark",
  },
];

export default function AppearanceScreen() {
  const theme = useTheme();
  const selectedPreference = useThemePreference();
  const setThemePreference = useSetThemePreference();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSelect = (preference: ThemePreference) => {
    if (preference === selectedPreference) {
      return;
    }

    setThemePreference(preference).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Failed to update theme";
      Alert.alert("Error", message);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = option.value === selectedPreference;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.option,
                index === 0 && styles.optionFirst,
                index === THEME_OPTIONS.length - 1 && styles.optionLast,
                isSelected && styles.optionSelected,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectionIndicatorActive,
                  ]}
                />
              </View>
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    option: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceMuted,
    },
    optionFirst: {
      marginTop: 0,
    },
    optionLast: {
      marginBottom: 0,
    },
    optionSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.surface,
    },
    optionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    optionLabel: {
      ...theme.typography.headingSm,
      color: theme.colors.text,
    },
    optionDescription: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    selectionIndicator: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: "transparent",
    },
    selectionIndicatorActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent,
    },
  });

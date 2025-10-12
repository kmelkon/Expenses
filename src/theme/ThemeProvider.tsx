import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkColors, lightColors, type Palette } from "./colors";
import { spacing, typography } from "./tokens";
import {
  ThemePreference,
  useAppearanceStore,
} from "../store/useAppearanceStore";

type StatusBarStyle = "light" | "dark";

export type Theme = {
  preference: ThemePreference;
  scheme: ColorSchemeName;
  colors: Palette;
  spacing: typeof spacing;
  typography: typeof typography;
  statusBarStyle: StatusBarStyle;
};

const defaultTheme: Theme = {
  preference: "system",
  scheme: "light",
  colors: lightColors,
  spacing,
  typography,
  statusBarStyle: "dark",
};

const ThemeContext = createContext<Theme>(defaultTheme);

const resolveTheme = (
  scheme: ColorSchemeName,
  preference: ThemePreference
): Theme => {
  const isDark = scheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    preference,
    scheme,
    colors,
    spacing,
    typography,
    statusBarStyle: isDark ? "light" : "dark",
  };
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const themePreference = useAppearanceStore(
    (state) => state.themePreference
  );

  const value = useMemo(
    () =>
      resolveTheme(
        themePreference === "system"
          ? colorScheme ?? "light"
          : themePreference,
        themePreference
      ),
    [colorScheme, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useTheme().colors;
}

export function useSpacing() {
  return useTheme().spacing;
}

export function useTypography() {
  return useTheme().typography;
}

export function useThemePreference() {
  return useAppearanceStore((state) => state.themePreference);
}

export function useSetThemePreference() {
  return useAppearanceStore((state) => state.setThemePreference);
}

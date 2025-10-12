import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkColors, lightColors, type Palette } from "./colors";
import { spacing, typography } from "./tokens";

type StatusBarStyle = "light" | "dark";

export type Theme = {
  scheme: ColorSchemeName;
  colors: Palette;
  spacing: typeof spacing;
  typography: typeof typography;
  statusBarStyle: StatusBarStyle;
};

const defaultTheme: Theme = {
  scheme: "light",
  colors: lightColors,
  spacing,
  typography,
  statusBarStyle: "dark",
};

const ThemeContext = createContext<Theme>(defaultTheme);

const resolveTheme = (scheme: ColorSchemeName): Theme => {
  const isDark = scheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    scheme,
    colors,
    spacing,
    typography,
    statusBarStyle: isDark ? "light" : "dark",
  };
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  const value = useMemo(
    () => resolveTheme(colorScheme ?? "light"),
    [colorScheme]
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

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const typography = {
  headingLg: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  headingMd: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  headingSm: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  captionStrong: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
} as const;

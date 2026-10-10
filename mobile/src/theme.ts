/** Brand tokens - same palette + type as the website's tailwind.config.ts. */
export const colors = {
  ink50: "#f7f6f3",
  ink100: "#eeece5",
  ink200: "#d9d4c6",
  ink300: "#b9b0a0",
  ink400: "#8a8170",
  ink500: "#5a5346",
  ink600: "#3d372d",
  ink700: "#2a261f",
  ink900: "#0f0e0a",
  sand50: "#fbf8f1",
  sand100: "#f3ecdc",
  sand200: "#e6d6b3",
  terra50: "#fbf1eb",
  terra100: "#f5dccc",
  terra300: "#dd8e63",
  terra500: "#c2562b",
  terra600: "#9f4520",
  white: "#ffffff",
  warnBg: "#fff7ed",
  warnBorder: "#fed7aa",
  warnText: "#9a3412",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#991b1b"
} as const;

export const fonts = {
  display: "Fraunces_600SemiBold",
  displayMedium: "Fraunces_500Medium",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemi: "Inter_600SemiBold",
  sansBold: "Inter_700Bold"
} as const;

export const radius = { md: 12, lg: 16, xl: 24 } as const;

export const shadow = {
  shadowColor: "#0f0e0a",
  shadowOpacity: 0.07,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3
} as const;

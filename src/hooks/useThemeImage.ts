import { useTheme } from "@/hooks/useTheme";

import logoDark from "@/assets/bitstores-logo.png";
import logoLight from "@/assets/bitstores-logo-light.png";
import heroDark from "@/assets/hero-phones.jpg";
import heroLight from "@/assets/hero-phones-light.jpg";
import tradeinDark from "@/assets/banner-tradein.jpg";
import tradeinLight from "@/assets/banner-tradein-light.jpg";
import accessoriesDark from "@/assets/banner-accessories.jpg";
import accessoriesLight from "@/assets/banner-accessories-light.jpg";

const imageMap = {
  logo: { light: logoLight, dark: logoDark },
  hero: { light: heroLight, dark: heroDark },
  tradein: { light: tradeinLight, dark: tradeinDark },
  accessories: { light: accessoriesLight, dark: accessoriesDark },
} as const;

export type ThemeImageKey = keyof typeof imageMap;

export function useThemeImage(key: ThemeImageKey): string {
  const { theme } = useTheme();
  return imageMap[key][theme];
}

export function getThemeImages(theme: "light" | "dark") {
  return {
    logo: imageMap.logo[theme],
    hero: imageMap.hero[theme],
    tradein: imageMap.tradein[theme],
    accessories: imageMap.accessories[theme],
  };
}

import type { ButtonVariant } from "../components/button/Button.types";

export type ThemeSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ThemeRadius = "xs" | "sm" | "md" | "lg" | "xl" | "full" | "none";
export type ThemeShadow = "sm" | "md" | "lg" | "xl" | "none";
export type ThemeColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "accent"
  | "neutral";

export type ThemeConfig = {
  base: {
    size: ThemeSize;
    radius: ThemeRadius;
    shadow: ThemeShadow;
  };
  button: {
    variant: ButtonVariant;
    color: ThemeColor;
    size: ThemeSize;
    radius: ThemeRadius;
    shadow: ThemeShadow;
  };
};

export type ThemeOptions = DeepPartial<ThemeConfig>;

export type ThemeProviderProps = {
  children: React.ReactNode;
  config?: ThemeOptions;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

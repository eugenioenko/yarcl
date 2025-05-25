import type {
  ThemeColor,
  ThemeRadius,
  ThemeShadow,
  ThemeSize,
} from "../../theme/Theme.types";

export type ButtonVariant = "solid" | "outlined" | "ghost" | "link";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ThemeColor;
  size?: ThemeSize;
  radius?: ThemeRadius;
  shadow?: ThemeShadow;
}

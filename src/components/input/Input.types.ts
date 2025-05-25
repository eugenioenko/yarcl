import type {
  ThemeColor,
  ThemeSize,
  ThemeRadius,
} from "../../theme/Theme.types";
import type React from "react";

export type InputVariant = "outlined" | "filled";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  variant?: InputVariant;
  color?: ThemeColor;
  size?: ThemeSize;
  radius?: ThemeRadius;
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

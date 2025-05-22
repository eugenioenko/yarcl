export type ButtonVariant = "solid" | "outlined" | "ghost" | "link";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "accent"
  | "neutral";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonRadius = "xs" | "sm" | "md" | "lg" | "xl" | "full" | "none";
export type ButtonShadow = "sm" | "md" | "lg" | "xl" | "none";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  radius?: ButtonRadius;
  shadow?: ButtonShadow;
}

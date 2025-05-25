import { tv } from "tailwind-variants";

export const inputVariants = tv({
  // TODO: define a base duration for all components
  base: [
    "flex bg-transparent text-foreground outline-none",
    "transition-colors duration-200 ease-in-out",
    "disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed",
    "hover:border-focus focus:border-focus",
    // "focus:ring-2 focus:ring-offset-2 focus:ring-primary",
    "focus:ring-0",
    "font-normal",
  ],
  variants: {
    variant: {
      outlined: "border border-border",
      filled: "border border-border bg-border/30",
    },
    color: {
      primary: "border-primary",
      secondary: "border-secondary",
      success: "border-success",
      warning: "border-warning",
      info: "border-info",
      accent: "border-accent",
      neutral: "border-neutral",
      danger: "border-danger",
    },
    size: {
      xs: "py-0.5 px-2 text-xs",
      sm: "py-1 px-3 text-sm",
      md: "py-1.5 px-4 text-base",
      lg: "py-2 px-5 text-lg",
      xl: "py-2.5 px-6 text-xl",
    },
    shadow: {
      none: "none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    },
    radius: {
      xs: "rounded-xs",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
      none: "rounded-none",
    },
    error: {
      true: "!border-danger text-danger placeholder:text-danger/70 focus:ring-danger focus:!border-danger", // Ensure error styles override others
      false: "",
    },
  },
  compoundVariants: [
    // Error states for outlined variant
    {
      variant: "outlined",
      error: true,
      class: "!border-danger hover:!border-danger/70",
    },
    // Error states for filled variant
    {
      variant: "filled",
      error: true,
      class: "!border-danger bg-danger/10 hover:bg-danger/20",
    },
  ],
  defaultVariants: {
    variant: "outlined",
    color: "neutral", // Default color for focus ring if not error
    size: "md",
    radius: "md",
    shadow: "none",
    error: false,
  },
});

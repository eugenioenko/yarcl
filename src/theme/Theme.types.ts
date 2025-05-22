import type {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  ButtonRadius,
  ButtonShadow,
} from "../components/button/Button.types";

export type ThemeConfig = {
  button: {
    variant: ButtonVariant;
    color: ButtonColor;
    size: ButtonSize;
    radius: ButtonRadius;
    shadow: ButtonShadow;
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

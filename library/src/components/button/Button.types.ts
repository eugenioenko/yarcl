import type { ButtonSize, ButtonRadius, ButtonColor } from '../../yarcl/yarcl.types';

export type { ButtonColor, ButtonRadius };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  radius?: ButtonRadius;
  color?: ButtonColor;
}

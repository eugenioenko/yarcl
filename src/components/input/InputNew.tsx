import { tv } from 'tailwind-variants';
import { forwardRef, type ReactNode } from 'react';

const inputContainer = tv({
  base: 'inline-flex items-center border overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-offset-2',
  variants: {
    color: {
      neutral: 'border-neutral-300 focus-within:border-primary focus-within:ring-primary',
      // Add other color variants as needed
    },
    size: { // Affects overall component font size and addon vertical padding indirectly
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    radius: { // Keys for rounding types
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      full: '',
      none: '',
    },
    hasPrefix: {
      true: '',
      false: '',
    },
    hasPostfix: {
      true: '',
      false: '',
    },
    disabled: {
      true: 'opacity-60 bg-neutral-100 cursor-not-allowed',
    },
  },
  compoundVariants: [
    // No prefix, no postfix (full rounding)
    { radius: 'xs', hasPrefix: false, hasPostfix: false, class: 'rounded-xs' },
    { radius: 'sm', hasPrefix: false, hasPostfix: false, class: 'rounded-sm' },
    { radius: 'md', hasPrefix: false, hasPostfix: false, class: 'rounded-md' },
    { radius: 'lg', hasPrefix: false, hasPostfix: false, class: 'rounded-lg' },
    { radius: 'xl', hasPrefix: false, hasPostfix: false, class: 'rounded-xl' },
    { radius: 'full', hasPrefix: false, hasPostfix: false, class: 'rounded-full' },

    // Prefix, no postfix (right side rounded)
    { radius: 'xs', hasPrefix: true, hasPostfix: false, class: 'rounded-r-xs' },
    { radius: 'sm', hasPrefix: true, hasPostfix: false, class: 'rounded-r-sm' },
    { radius: 'md', hasPrefix: true, hasPostfix: false, class: 'rounded-r-md' },
    { radius: 'lg', hasPrefix: true, hasPostfix: false, class: 'rounded-r-lg' },
    { radius: 'xl', hasPrefix: true, hasPostfix: false, class: 'rounded-r-xl' },
    { radius: 'full', hasPrefix: true, hasPostfix: false, class: 'rounded-r-full' },

    // No prefix, postfix (left side rounded)
    { radius: 'xs', hasPrefix: false, hasPostfix: true, class: 'rounded-l-xs' },
    { radius: 'sm', hasPrefix: false, hasPostfix: true, class: 'rounded-l-sm' },
    { radius: 'md', hasPrefix: false, hasPostfix: true, class: 'rounded-l-md' },
    { radius: 'lg', hasPrefix: false, hasPostfix: true, class: 'rounded-l-lg' },
    { radius: 'xl', hasPrefix: false, hasPostfix: true, class: 'rounded-l-xl' },
    { radius: 'full', hasPrefix: false, hasPostfix: true, class: 'rounded-l-full' },

    // Both prefix and postfix (no rounding)
    { radius: 'xs', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    { radius: 'sm', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    { radius: 'md', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    { radius: 'lg', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    { radius: 'xl', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    { radius: 'full', hasPrefix: true, hasPostfix: true, class: 'rounded-none' },
    
    // Radius 'none' always results in no rounding
    { radius: 'none', class: 'rounded-none' },
  ],
  defaultVariants: {
    color: 'neutral',
    size: 'md',
    radius: 'md',
    disabled: false,
    hasPrefix: false,
    hasPostfix: false,
  }
});

const inputElementStyles = tv({
  base: 'flex-grow p-0 border-none outline-none bg-transparent disabled:cursor-not-allowed w-full',
  variants: {
    size: { // Controls padding of the input field itself
      xs: 'py-0.5 px-2',
      sm: 'py-1 px-3',
      md: 'py-1.5 px-4',
      lg: 'py-2 px-5',
      xl: 'py-2.5 px-6',
    },
  },
  defaultVariants: {
    size: 'md',
  }
});

const addonStyles = tv({
  base: 'flex items-center justify-center bg-neutral-50 text-neutral-600 px-3',
  variants: {
    size: { // Vertical padding to match input height, derived from container size
      xs: 'py-0.5', // Matches inputElement.xs py
      sm: 'py-1',   // Matches inputElement.sm py
      md: 'py-1.5', // Matches inputElement.md py
      lg: 'py-2',   // Matches inputElement.lg py
      xl: 'py-2.5', // Matches inputElement.xl py
    },
    position: {
      prefix: 'border-r border-neutral-300',
      postfix: 'border-l border-neutral-300',
    }
  },
  defaultVariants: {
    size: 'md',
  }
});

export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  prefix?: ReactNode;
  postfix?: ReactNode;
  size?: InputSize;
  radius?: InputRadius;
  // color prop can be added to InputProps if needed to control inputContainer color variant
  containerClassName?: string; // To style the outer container
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, postfix, className, containerClassName, size, radius, disabled, type = 'text', ...props }, ref) => {
    
    const finalSize = size || inputContainer.defaultVariants.size; // Use prop size or default for children
    const actualRadius = radius || inputContainer.defaultVariants.radius; // Use prop radius or default

    const hasPrefix = !!prefix;
    const hasPostfix = !!postfix;

    return (
      <div 
        className={inputContainer({ 
          size, // Let tv handle default if size is undefined
          radius: actualRadius, 
          disabled, 
          hasPrefix,
          hasPostfix,
          class: containerClassName 
        })}
      >
        {prefix && (
          <span className={addonStyles({ size: finalSize, position: 'prefix' })}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={inputElementStyles({ size: finalSize, class: className })}
          disabled={disabled}
          {...props}
        />
        {postfix && (
          <span className={addonStyles({ size: finalSize, position: 'postfix' })}>
            {postfix}
          </span>
        )}
      </div>
    );
  }
);

InputBase.displayName = 'InputBase';

export const Input = InputBase;
Input.displayName = 'Input';

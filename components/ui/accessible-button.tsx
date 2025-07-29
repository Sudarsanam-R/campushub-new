import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'aria-label'?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled = false,
      children,
      leftIcon,
      rightIcon,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const hasIcon = leftIcon || rightIcon || isLoading;
    const hasAriaLabel = Boolean(ariaLabel || (asChild && props['aria-label']));
    
    // Warn in development if the button is icon-only and missing an aria-label
    if (process.env.NODE_ENV === 'development' && !hasAriaLabel) {
      const isIconOnly = React.Children.count(children) === 0 && hasIcon;
      
      if (isIconOnly) {
        console.warn(
          'Icon-only buttons must have an aria-label for accessibility. ' +
          'Please provide an aria-label prop to the button.'
        );
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading && (
          <Loader2 className={cn(
            'h-4 w-4 animate-spin',
            children ? 'mr-2' : ''
          )} 
          aria-hidden="true"
        />
        )}
        {!isLoading && leftIcon && (
          <span className={cn('inline-flex', children ? 'mr-2' : '')} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className={cn('inline-flex', children ? 'ml-2' : '')} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

AccessibleButton.displayName = 'Button';

export { AccessibleButton, buttonVariants };

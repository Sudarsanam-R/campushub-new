import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      label,
      description,
      error,
      required = false,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      errorClassName,
      id: propId,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if one isn't provided
    const id = React.useId();
    const inputId = propId || `input-${id}`;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    return (
      <div className={cn('space-y-2 w-full', containerClassName)}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-foreground',
              { 'text-destructive': error },
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
            )}
          </label>
          {!required && !error && (
            <span className="text-xs text-muted-foreground">Optional</span>
          )}
        </div>

        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {React.cloneElement(leftIcon as React.ReactElement, {
                className: 'h-4 w-4 text-muted-foreground',
                'aria-hidden': 'true'
              })}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-destructive focus-visible:ring-destructive': error,
                'pl-10': leftIcon,
                'pr-10': rightIcon,
              },
              className
            )}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`.trim() || undefined}
            required={required}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {React.cloneElement(rightIcon as React.ReactElement, {
                className: 'h-4 w-4 text-muted-foreground',
                'aria-hidden': 'true'
              })}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className={cn(
              'text-sm font-medium text-destructive',
              errorClassName
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export { FormInput };

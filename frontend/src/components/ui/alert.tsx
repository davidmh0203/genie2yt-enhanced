import * as React from 'react';
import { cn } from './utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'destructive' && 'border-red-200 bg-red-50 text-red-800',
        variant === 'default' && 'border-blue-200 bg-blue-50 text-blue-800',
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
  }
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };

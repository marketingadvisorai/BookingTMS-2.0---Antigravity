import { ReactNode } from 'react';

interface WidgetContainerProps {
  children: ReactNode;
  className?: string;
}

export function WidgetContainer({ children, className = '' }: WidgetContainerProps) {
  return (
    <div className={`w-full h-full overflow-auto overscroll-contain ${className}`}>
      <div className="min-h-full">
        {children}
      </div>
    </div>
  );
}

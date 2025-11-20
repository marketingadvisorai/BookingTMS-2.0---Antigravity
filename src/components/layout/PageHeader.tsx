import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  sticky?: boolean;
}

export function PageHeader({ title, description, action, sticky = false }: PageHeaderProps) {
  return (
    <div className={`
      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4
      ${sticky ? 'sticky top-16 lg:static bg-gray-50 dark:bg-[#161616] py-2 lg:py-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 z-10 border-b lg:border-b-0 border-gray-200 dark:border-[#2a2a2a] lg:mb-0' : ''}
    `}>
      <div className="flex-1 min-w-0">
        <h1 className="text-gray-900 dark:text-white mb-2 truncate">{title}</h1>
        {description && (
          <p className="text-gray-600 dark:text-[#737373] text-sm sm:text-base lg:mb-6">{description}</p>
        )}
      </div>
      {action && (
        <div className="w-full sm:w-auto flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

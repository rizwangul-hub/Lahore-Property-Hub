import React from 'react';

export interface LoadingStateProps {
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  count = 4,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      aria-label="Loading properties"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-navy-100 bg-white p-4 shadow-subtle animate-pulse space-y-4"
        >
          <div className="h-48 w-full rounded-xl bg-navy-100" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-navy-100" />
            <div className="h-3 w-1/2 rounded bg-navy-100" />
          </div>
          <div className="flex justify-between pt-2 border-t border-navy-100">
            <div className="h-4 w-1/3 rounded bg-navy-100" />
            <div className="h-4 w-1/4 rounded bg-navy-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

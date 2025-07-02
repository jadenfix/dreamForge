import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white/5 dark:bg-gray-800 rounded-xl p-6 space-y-4">
      <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-8 bg-white/10 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-white/10 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white/5 dark:bg-gray-800 rounded-xl p-6">
      <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-end space-x-2">
            <div 
              className="bg-white/10 dark:bg-gray-700 rounded w-8" 
              style={{ height: `${Math.random() * 60 + 20}px` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white/5 dark:bg-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-6 flex space-x-4">
            <div className="h-4 bg-white/10 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-white/10 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default { SkeletonCard, SkeletonChart, SkeletonTable }; 
import React from 'react';

export default function Stepper({ steps, current }) {
  return (
    <div className="flex items-center mb-6">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center w-full">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                idx <= current ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {idx + 1}
            </div>
            <span className="text-xs mt-1 text-center text-gray-700 dark:text-gray-300 w-max">
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-700 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 
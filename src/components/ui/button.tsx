import React from 'react';

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium shadow bg-gray-900 text-white hover:opacity-90 disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
}

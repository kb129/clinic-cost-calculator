import React from 'react';

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`rounded-2xl bg-white shadow ${className}`} {...rest} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`p-6 ${className}`} {...rest} />;
}

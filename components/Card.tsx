'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg',
        hoverable && 'cursor-pointer transition-all hover:border-border-strong hover:shadow-sm',
        className
      )}
      {...props}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors';
  const variantStyles = {
    primary: 'app-bg-lime app-text-green hover:app-bg-accent/90',
    secondary: 'bg-surface-alt border border-border text-text hover:bg-surface-alt/80',
    ghost: 'text-text hover:bg-surface-alt',
  };
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}

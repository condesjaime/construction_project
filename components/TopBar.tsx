'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PanelLeft, BellIcon } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  rightContent?: React.ReactNode;
}

export function TopBar({
  title,
  subtitle,
  breadcrumbs,
  rightContent,
}: TopBarProps) {
  return (
    <div className="bg-surface border-b border-border sticky top-0 z-30 w-full">
      {/* Top bar */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-12">
          <div className="flex justify-items-center gap-2">
            <div className="w-6 h-6 rounded bg-transparent app-text-sage flex items-center justify-center text-sm font-bold">
              <PanelLeft size={15} className="app-text-sage" />
            </div>
            
          </div>
          
          
        </div>
        <div className="flex items-center gap-4  pl-4">
            <div className="text-sm rounded-full px-3 py-1 app-text-sage">
              <BellIcon size={16} />
            </div>
            <div className="text-sm text-text-muted rounded-full app-text-sage px-3 py-1">
              R
            </div>
          </div>
      </div>

      {/* Title bar */}
      <div className="flex justify-between px-8 py-6 space-y-2 z-100">
        <div>
          <h1 className="text-3xl font-semibold text-text">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        <div>
          {rightContent}  
        </div>
        
      </div>
    </div>
  );
}

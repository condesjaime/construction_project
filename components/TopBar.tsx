'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  PanelLeft,
  BellIcon,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};

  const initials =
    user?.fullName
      ?.split(' ')
      ?.map((n: string) => n[0])
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    router.push('/');
  };

  return (
    <div className="bg-surface border-b border-border sticky top-0 z-30 w-full">
      {/* Top bar */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-12">
          <div className="flex justify-items-center gap-2">
            <div className="w-6 h-6 rounded bg-transparent app-text-sage flex items-center justify-center text-sm font-bold">
              <PanelLeft
                size={15}
                className="app-text-sage"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4">
          {/* Notifications */}
          <button className="text-sm rounded-full px-3 py-1 app-text-sage hover:bg-surface-alt transition-colors">
            <BellIcon size={16} />
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 hover:bg-surface-alt rounded-full px-3 py-2 transition-colors"
            >
              <div className="w-9 h-9 rounded-full app-bg-lime app-text-green flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>

              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform',
                  showMenu && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-14 w-64 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {/* User info */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full app-bg-lime app-text-green flex items-center justify-center font-semibold">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-text truncate">
                        {user?.fullName || 'User'}
                      </div>

                      <div className="text-sm text-text-muted truncate">
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-surface-alt transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title bar */}
      <div className="flex justify-between px-8 py-6 space-y-2 z-100">
        <div>
          <h1 className="text-3xl font-semibold text-text">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-text-muted">
              {subtitle}
            </p>
          )}
        </div>

        <div>{rightContent}</div>
      </div>
    </div>
  );
}
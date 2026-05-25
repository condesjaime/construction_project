'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {Home, Calendar, BookOpen, Settings, Lock } from 'lucide-react';
interface SideNavProps {
  children?: React.ReactNode;
}

export function SideNav({ children }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  // Hide sidenav on login page
  const hideSideNav = pathname === '/';
  const toggleNav = () => setIsOpen(!isOpen);

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: BookOpen, label: 'Site Diary', href: '/diary' },
    { icon: Settings, label: 'Settings', href: '/settings' },
   
  ];

  return (
    <div className="flex">
      {!hideSideNav && (<>
      
     
      {/* Sidebar */}
      <div
         className={cn(
          'fixed left-0 top-0 z-40 h-[calc(100vh-2rem)] m-2 bg-[#153A28] border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        
        {/* Nav Items */}
        <nav className="p-2 space-y-2 mt-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 app-text-sage rounded-lg transition-colors',
                  'hover:bg-surface-alt hover:app-text-green',
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </a>
            );
          })}
        </nav>
       <Lock size={20} className="absolute bottom-4 left-5 transform -translate-x-1/2 app-text-sage" />   
      </div>
       </>)}    
      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300 p-3 w-[1300px]', isOpen ? 'ml-64' : 'ml-20')}>
        {children}
      </div>
    </div>
  );
}

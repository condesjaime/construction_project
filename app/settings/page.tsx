'use client';

import React from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, Button } from '@/components/Card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar
        title="Settings"
        subtitle="Configure your application preferences"
        breadcrumbs={[{ label: 'Settings', href: '/settings' }]}
      />

      <div className="flex-1 overflow-auto bg-bg p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-text">
                  Task deadline reminders
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-text">
                  Team assignment notifications
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-text">
                  Project updates
                </span>
              </label>
            </div>
          </Card>

          {/* Team Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Teams</h2>
            <Button variant="secondary">+ Add Team</Button>
          </Card>

          {/* Save */}
          <div className="flex gap-2 pt-4">
            <Button variant="primary">Save Changes</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

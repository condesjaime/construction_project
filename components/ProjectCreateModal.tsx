'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
}

export default function ProjectCreateModal({
  isOpen,
  onClose,
  onCreated,
}: ProjectCreateModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    color: 'p1',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        progress: '0',
        status: 'active',
      }),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error('API Error:', responseData);
      throw new Error(responseData.message || responseData.error);
    }

    console.log('✅ Created project:', responseData);

    onCreated?.(responseData);

    setForm({
      name: '',
      description: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      color: 'p1',
    });

    onClose();

  } catch (err) {
    console.error('❌ Error creating project:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Project</h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              rows={3}
            />
          </div>

          {/* Client + Location */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="client"
              placeholder="Client"
              value={form.client}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium">Color</label>
            <select
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="p1">Blue</option>
              <option value="p2">Green</option>
              <option value="p3">Orange</option>
              <option value="p4">Red</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 app-bg-lime app-text-green rounded-lg"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  Building2,
} from 'lucide-react';


import { toast } from 'sonner';

interface LoginForm {
  email: string;
  password: string;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [createUserForm, setCreateUserForm] =
    useState<CreateUserForm>({
      fullName: '',
      email: '',
      password: '',
    });

  const login = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Login failed');
      }

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken',data.refreshToken);
      // Optional user info
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Welcome Back! ', data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials!');
      console.error(error);
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create account'
        );
      }

      toast.success(
        'Account created successfully'
      );

      setActiveTab('login');

      setLoginForm({
        email: createUserForm.email,
        password: '',
      });

      setCreateUserForm({
        fullName: '',
        email: '',
        password: '',
      });

    } catch (error: any) {
      toast.error(
        error.message || 'Signup failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-lime-500 flex items-center justify-center mx-auto shadow-lg">
            <Building2
              size={30}
              className="text-black"
            />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mt-5">
            Construction Scheduler
          </h1>

          <p className="text-slate-500 mt-2">
            Manage projects, teams, and site diary
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() =>
                setActiveTab('login')
              }
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === 'login'
                  ? 'bg-lime-500 text-black'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Login
            </button>

            <button
              onClick={() =>
                setActiveTab('signup')
              }
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-lime-500 text-black'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-8">
            {/* LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          password:
                            e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  Sign In
                </button>
              </div>
            )}

            {/* SIGNUP */}
            {activeTab === 'signup' && (
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={
                        createUserForm.fullName
                      }
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          fullName:
                            e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={
                        createUserForm.email
                      }
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Create password"
                      value={
                        createUserForm.password
                      }
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          password:
                            e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  onClick={createUser}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          @copyrights 2026
        </div>
      </div>
    </div>
  );
}
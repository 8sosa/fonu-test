// pages/Login.tsx
import React, { useState } from 'react';
import api from '../api/client';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

export const Login = ({ 
  onLoginSuccess, 
  onRegisterClick 
}: { 
  onLoginSuccess: () => void, 
  onRegisterClick: () => void 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-3xl mb-4 shadow-xl shadow-indigo-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Enter your credentials to access Fonu</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-3xl border border-slate-100 space-y-6">
          {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="admin@fonu.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-indigo-100"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-500">
            New to Fonu?{' '}
            <button 
              type="button"
              onClick={onRegisterClick} 
              className="text-indigo-600 font-bold hover:underline"
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
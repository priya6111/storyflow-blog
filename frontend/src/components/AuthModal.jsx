import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(identifier, password);
        addToast('Welcome back! You are now logged in.', 'success');
      } else {
        await register({
          name,
          username,
          email,
          password,
          bio,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });
        addToast('Account created successfully! Welcome to StoryFlow.', 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername) => {
    setError('');
    setIsLoading(true);
    try {
      await login(demoUsername, 'password123');
      addToast(`Logged in as @${demoUsername}!`, 'success');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              StoryFlow
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-sm font-semibold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 text-sm font-semibold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="mb-6 p-3.5 bg-gradient-to-br from-indigo-50/70 via-brand-50/50 to-purple-50/70 border border-brand-200/60 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 mb-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Instant 1-Click Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alexjohnson')}
                disabled={isLoading}
                className="text-left px-2.5 py-1.5 bg-white hover:bg-brand-50 border border-brand-200/80 rounded-lg shadow-2xs transition group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-brand-700 flex items-center justify-between">
                  <span>Alex Johnson</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                </div>
                <div className="text-[10px] text-slate-500">Staff Eng (Admin)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarahchen')}
                disabled={isLoading}
                className="text-left px-2.5 py-1.5 bg-white hover:bg-brand-50 border border-brand-200/80 rounded-lg shadow-2xs transition group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                  Sarah Chen
                </div>
                <div className="text-[10px] text-slate-500">AI Researcher</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('marcusbrody')}
                disabled={isLoading}
                className="text-left px-2.5 py-1.5 bg-white hover:bg-brand-50 border border-brand-200/80 rounded-lg shadow-2xs transition group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                  Marcus Brody
                </div>
                <div className="text-[10px] text-slate-500">Design Architect</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('priyasharma')}
                disabled={isLoading}
                className="text-left px-2.5 py-1.5 bg-white hover:bg-brand-50 border border-brand-200/80 rounded-lg shadow-2xs transition group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                  Priya Sharma
                </div>
                <div className="text-[10px] text-slate-500">Cloud & DevOps</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'login' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. alexjohnson or alex@storyflow.dev"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (e.g. password123)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="janedoe"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bio (Optional)
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short bio about what you write or build"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PenSquare,
  Search,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  BookOpen,
  Menu,
  X
} from 'lucide-react';

export function Navbar({ onNavigate, currentView, searchQuery, setSearchQuery }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => onNavigate('create'));
    } else {
      onNavigate('create');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 bg-clip-text text-transparent">
                StoryFlow
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-brand-600">
                Tech & Ideas
              </span>
            </div>
          </button>

          {/* Quick Search on Desktop */}
          <div className="hidden md:flex items-center relative w-64 lg:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, topics, authors..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-brand-300 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Write Button */}
          <button
            onClick={handleWriteClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-slate-700 hover:text-brand-600 hover:bg-brand-50 text-sm font-semibold transition"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write</span>
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">@{user.username}</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile', user.username);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 text-left transition"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile & Posts</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('bookmarks');
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 text-left transition"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Reading List (Bookmarks)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={handleWriteClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-50 text-brand-700 font-semibold text-sm"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write a Post</span>
          </button>

          {isAuthenticated ? (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onNavigate('profile', user.username);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-slate-700"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('bookmarks');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-slate-700"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 py-2 text-sm font-semibold text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-sm font-semibold bg-brand-600 text-white rounded-xl"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

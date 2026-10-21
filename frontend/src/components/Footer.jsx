import React from 'react';
import { BookOpen, Github, Twitter, Linkedin, Heart, Shield, Code, Database } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">StoryFlow</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              A modern, full-stack blogging and publishing platform crafted with Node.js, Express, SQLite, React 18, and Tailwind CSS.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                <Code className="w-3 h-3 text-brand-600" /> RESTful Express
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                <Database className="w-3 h-3 text-emerald-600" /> Native SQLite
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                <Shield className="w-3 h-3 text-indigo-600" /> JWT Auth
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Explore Categories</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {['Web Dev', 'AI & Machine Learning', 'UI & UX Design', 'Cloud & DevOps', 'Software Engineering'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate('home', null, { category: cat })}
                    className="hover:text-brand-600 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-brand-600 transition">
                  Latest Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('create')} className="hover:text-brand-600 transition">
                  Write a Post
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookmarks')} className="hover:text-brand-600 transition">
                  My Bookmarks
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} StoryFlow. Full-Stack Blogging Platform.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for learners and developers</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

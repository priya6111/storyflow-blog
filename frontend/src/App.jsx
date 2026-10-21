import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostEditorPage } from './pages/PostEditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookmarksPage } from './pages/BookmarksPage';

export function MainLayout() {
  const [currentView, setCurrentView] = useState('home');
  const [activeParam, setActiveParam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState(null);

  // Router navigator helper
  const navigate = (view, param = null, extra = {}) => {
    setCurrentView(view);
    setActiveParam(param);
    if (extra.category) setCategoryFilter(extra.category);
    if (extra.tag) setTagFilter(extra.tag);
    if (view === 'home' && !extra.tag && !extra.category) {
      // Keep search or reset
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onNavigate={navigate}
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={navigate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initialCategory={categoryFilter}
            initialTag={tagFilter}
          />
        )}

        {currentView === 'post' && (
          <PostDetailPage
            slugOrId={activeParam}
            onNavigate={navigate}
          />
        )}

        {currentView === 'create' && (
          <PostEditorPage
            onNavigate={navigate}
          />
        )}

        {currentView === 'edit' && (
          <PostEditorPage
            postId={activeParam}
            onNavigate={navigate}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            username={activeParam}
            onNavigate={navigate}
          />
        )}

        {currentView === 'bookmarks' && (
          <BookmarksPage
            onNavigate={navigate}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}

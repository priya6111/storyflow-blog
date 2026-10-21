import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Bookmark, ArrowLeft, BookOpen } from 'lucide-react';

export function BookmarksPage({ onNavigate }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    async function loadBookmarks() {
      try {
        setIsLoading(true);
        const res = await api.users.getBookmarks();
        if (res.success) {
          setPosts(res.posts || []);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        addToast('Failed to load reading list', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadBookmarks();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
        <Bookmark className="w-12 h-12 text-brand-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Reading List</h2>
        <p className="text-xs text-slate-600 mb-6">
          Sign in to access your saved articles and bookmarks anytime.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition"
        >
          Sign In to View
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-brand-600" />
            <span>Reading List</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} saved for later
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500">Loading your reading list...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your reading list is empty</h3>
          <p className="text-xs text-slate-500 mb-6">
            Explore articles and click the bookmark icon to save them here for offline reading or quick reference.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Discover Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onNavigate={onNavigate}
              onBookmarkChange={(postId, bookmarked) => {
                if (!bookmarked) {
                  setPosts(prev => prev.filter(p => p.id !== postId));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

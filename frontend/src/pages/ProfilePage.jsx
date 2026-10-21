import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';
import {
  User,
  Calendar,
  Heart,
  BookOpen,
  MessageSquare,
  Edit2,
  Bookmark,
  Check,
  X,
  Sparkles
} from 'lucide-react';

export function ProfilePage({ username, onNavigate }) {
  const { user: currentUser, updateUser } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0 });
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'bookmarks'
  const [isLoading, setIsLoading] = useState(true);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.users.getProfile(username);
      if (res.success) {
        setProfileUser(res.user);
        setStats(res.stats || { posts: 0, likes: 0, comments: 0 });
        setPosts(res.posts || []);

        setEditName(res.user.name || '');
        setEditAvatar(res.user.avatar || '');
        setEditBio(res.user.bio || '');
      }

      if (isOwnProfile) {
        const bookRes = await api.users.getBookmarks();
        if (bookRes.success) {
          setBookmarks(bookRes.posts || []);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      addToast(err.message || 'User not found', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.auth.updateProfile({
        name: editName,
        avatar: editAvatar,
        bio: editBio
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileUser(res.user);
        setIsEditingProfile(false);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">Loading author profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">User Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">No account exists for @{username}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const formattedJoinDate = new Date(profileUser.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Profile Header Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`}
              alt={profileUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-100 shadow-md"
            />
            {profileUser.role === 'admin' && (
              <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-slate-900 text-brand-300 text-[10px] font-bold border border-slate-700">
                Staff
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profileUser.name}</h1>
                <p className="text-xs text-slate-500">@{profileUser.username}</p>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition mx-auto sm:mx-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-2xl font-serif-reading">
              {profileUser.bio || 'Author and tech enthusiast on StoryFlow.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {formattedJoinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xl font-bold text-slate-900">{stats.posts}</span>
            <p className="text-[11px] text-slate-500 font-medium">Articles</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xl font-bold text-rose-600">{stats.likes}</span>
            <p className="text-[11px] text-slate-500 font-medium">Likes Received</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xl font-bold text-slate-900">{stats.comments}</span>
            <p className="text-[11px] text-slate-500 font-medium">Comments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Articles ({posts.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'bookmarks'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Reading List ({bookmarks.length})</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'posts' ? (
        posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No published articles yet</p>
            {isOwnProfile && (
              <button
                onClick={() => onNavigate('create')}
                className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                Write Your First Story
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(p => (
              <PostCard key={p.id} post={p} onNavigate={onNavigate} />
            ))}
          </div>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Your reading list is empty</p>
            <p className="text-xs text-slate-400 mt-1">Bookmark interesting articles to read anytime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map(p => (
              <PostCard
                key={p.id}
                post={p}
                onNavigate={onNavigate}
                onBookmarkChange={(postId, bookmarked) => {
                  if (!bookmarked) {
                    setBookmarks(prev => prev.filter(b => b.id !== postId));
                  }
                }}
              />
            ))}
          </div>
        )
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Your Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell readers about yourself..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

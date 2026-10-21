import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Heart, MessageSquare, Bookmark, Clock, Eye, Sparkles } from 'lucide-react';

export function PostCard({ post, onNavigate, onBookmarkChange }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', () => handleLike(e));
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.posts.toggleLike(post.id);
      setIsLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      addToast('Failed to update like status', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', () => handleBookmark(e));
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await api.posts.toggleBookmark(post.id);
      setIsBookmarked(res.bookmarked);
      addToast(
        res.bookmarked ? 'Added to your reading list' : 'Removed from reading list',
        'success'
      );
      if (onBookmarkChange) onBookmarkChange(post.id, res.bookmarked);
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      addToast('Failed to bookmark post', 'error');
    } finally {
      setIsBookmarking(false);
    }
  };

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article
      onClick={() => onNavigate('post', post.slug || post.id)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
            {post.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition ${
              isBookmarked
                ? 'bg-brand-600 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark for later'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Author info & Read time */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div
              className="flex items-center gap-2 hover:text-slate-900 transition"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('profile', post.author.username);
              }}
            >
              <img
                src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-semibold text-slate-700 hover:text-brand-600">
                {post.author.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.read_time || 3} min read</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug mb-2 line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 font-serif-reading">
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('home', null, { tag });
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{formattedDate}</span>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition ${
                isLiked ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400" title="Views">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

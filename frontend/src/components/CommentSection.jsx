import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  Trash2,
  Heart,
  LogIn,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function CommentSection({ postId, postAuthorId }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Load comments
  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await api.comments.getByPost(postId);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.comments.create(postId, newComment.trim());
      if (res.success && res.comment) {
        setComments(prev => [...prev, res.comment]);
        setNewComment('');
        addToast('Comment added!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.comments.delete(commentId);
      if (res.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setDeleteTargetId(null);
        addToast('Comment deleted', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    // Optimistic toggle
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const nextLiked = !c.is_liked;
        return {
          ...c,
          is_liked: nextLiked,
          likes_count: nextLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 0) - 1)
        };
      }
      return c;
    }));

    try {
      const res = await api.comments.toggleLike(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: res.liked,
            likes_count: res.likes_count
          };
        }
        return c;
      }));
    } catch (err) {
      // Re-fetch on error to ensure sync
      fetchComments();
      addToast('Failed to like comment', 'error');
    }
  };

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Discussion</h3>
            <p className="text-xs text-slate-500">
              {comments.length} {comments.length === 1 ? 'thought' : 'thoughts'} shared
            </p>
          </div>
        </div>
      </div>

      {/* Write Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-10 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-500">@{user.username}</p>
            </div>
          </div>

          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your perspective or ask a question..."
            maxLength={1000}
            className="w-full p-3.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {newComment.length} / 1000 characters
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Post Comment</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-brand-50/40 border border-slate-200 text-center">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Join the conversation</h4>
          <p className="text-xs text-slate-600 mb-4 max-w-md mx-auto">
            Sign in to share your thoughts, ask questions, and engage with the author and community.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No comments yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isPostAuthor = comment.author.id === postAuthorId;
            const canDelete =
              user && (user.id === comment.author.id || user.id === postAuthorId || user.role === 'admin');

            return (
              <div
                key={comment.id}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {comment.author.name}
                        </span>
                        {isPostAuthor && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                            Author
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          @{comment.author.username}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <div>
                      {deleteTargetId === comment.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-rose-600 font-semibold">Delete?</span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(null)}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteTargetId(comment.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Body */}
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line pl-10 font-serif-reading">
                  {comment.content}
                </p>

                {/* Like Button */}
                <div className="mt-3 pl-10 flex items-center gap-4">
                  <button
                    onClick={() => handleToggleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs transition ${
                      comment.is_liked
                        ? 'text-rose-600 font-semibold'
                        : 'text-slate-500 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{comment.likes_count || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

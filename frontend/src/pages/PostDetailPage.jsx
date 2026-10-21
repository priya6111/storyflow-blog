import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CommentSection } from '../components/CommentSection';
import { PostCard } from '../components/PostCard';
import {
  Heart,
  Bookmark,
  Share2,
  Edit3,
  Trash2,
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Check,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export function PostDetailPage({ slugOrId, onNavigate }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch post details
  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const res = await api.posts.getBySlugOrId(slugOrId);
      if (res.success && res.post) {
        setPost(res.post);
        setIsLiked(res.post.is_liked || false);
        setLikesCount(res.post.likes_count || 0);
        setIsBookmarked(res.post.is_bookmarked || false);

        // Fetch related posts from same category
        if (res.post.category) {
          api.posts.getAll({ category: res.post.category, limit: 3 })
            .then(catRes => {
              if (catRes.success) {
                setRelatedPosts((catRes.posts || []).filter(p => p.id !== res.post.id).slice(0, 2));
              }
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load post:', err);
      addToast(err.message || 'Post not found', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slugOrId) {
      fetchPost();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slugOrId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => handleLike());
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.posts.toggleLike(post.id);
      setIsLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      addToast('Failed to like post', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => handleBookmark());
      return;
    }

    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await api.posts.toggleBookmark(post.id);
      setIsBookmarked(res.bookmarked);
      addToast(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success');
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      addToast('Failed to bookmark post', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    addToast('Article link copied to clipboard!', 'success');
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      const res = await api.posts.delete(post.id);
      if (res.success) {
        addToast('Post deleted successfully', 'success');
        onNavigate('home');
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading story...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The article you are looking for may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>
      </div>
    );
  }

  const isAuthor = user && (user.id === post.author.id || user.role === 'admin');

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" />
        <span>Back to Feed</span>
      </button>

      {/* Header Info */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            {post.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.read_time || 4} min read</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.views || 0} views</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-slate-600 font-serif-reading leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author Card & Actions Bar */}
        <div className="pt-4 border-t border-b border-slate-200 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Author */}
          <div
            onClick={() => onNavigate('profile', post.author.username)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 group-hover:border-brand-500 transition"
            />
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition">
                {post.author.name}
              </p>
              <p className="text-xs text-slate-500">
                @{post.author.username} {post.author.bio ? `· ${post.author.bio.slice(0, 45)}...` : ''}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Edit & Delete for Author */}
            {isAuthor && (
              <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-200">
                <button
                  onClick={() => onNavigate('edit', post.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                  title="Edit Post"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full text-xs font-semibold transition ${
                isBookmarked
                  ? 'bg-brand-50 text-brand-600 border border-brand-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Save post'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Copy share link"
            >
              {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[21/9] bg-slate-100">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Markdown Body Content */}
      <div className="prose prose-slate max-w-none">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
          {post.tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('home', null, { tag })}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <CommentSection postId={post.id} postAuthorId={post.author.id} />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span>More in {post.category}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map(related => (
              <PostCard
                key={related.id}
                post={related}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-bold text-slate-900">Delete this post?</h4>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              This action cannot be undone. All comments, likes, and bookmarks associated with this post will also be deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

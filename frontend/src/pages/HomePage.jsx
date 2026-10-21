import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';
import {
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
  Flame,
  MessageCircle,
  Eye,
  ArrowRight,
  BookOpen,
  Users,
  Search,
  X
} from 'lucide-react';

export function HomePage({ onNavigate, searchQuery, setSearchQuery, initialCategory = 'All', initialTag = null }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState('latest');
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Categories & Authors
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, authRes, statsRes] = await Promise.all([
          api.categories.getAll(),
          api.users.getAuthors(),
          api.categories.getStats()
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (authRes.success) setAuthors(authRes.authors || []);
        if (statsRes.success) setStats(statsRes.stats || null);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch posts when filters change
  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 9,
        sort: sortBy
      };
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await api.posts.getAll(params);
      if (res.success) {
        setPosts(res.posts || []);
        setPagination(res.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [selectedCategory, selectedTag, sortBy, searchQuery]);

  const featuredPost = posts.length > 0 && selectedCategory === 'All' && !selectedTag && !searchQuery ? posts[0] : null;
  const feedPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Featured Hero Article Banner (Shown on default home feed) */}
      {featuredPost && (
        <div
          onClick={() => onNavigate('post', featuredPost.slug || featuredPost.id)}
          className="relative mb-12 rounded-3xl overflow-hidden bg-slate-900 text-white cursor-pointer group shadow-2xl transition hover:shadow-brand-500/10"
        >
          <div className="absolute inset-0">
            <img
              src={featuredPost.cover_image}
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-35 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Story
              </span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {featuredPost.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight group-hover:text-brand-300 transition">
              {featuredPost.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-6 font-serif-reading">
              {featuredPost.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={featuredPost.author.avatar}
                  alt={featuredPost.author.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
                <div>
                  <p className="text-xs font-bold text-white">{featuredPost.author.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {featuredPost.read_time} min read
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-brand-300 group-hover:text-white transition">
                <span>Read Story</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Posts Feed */}
        <div className="lg:col-span-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedTag(null); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'All' && !selectedTag
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Topics
            </button>
            {['Web Dev', 'AI & Machine Learning', 'UI & UX Design', 'Cloud & DevOps', 'Software Engineering'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSelectedTag(null); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Sort by:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'latest', label: 'Latest', icon: Clock },
                  { id: 'popular', label: 'Most Liked', icon: Flame },
                  { id: 'discussed', label: 'Most Discussed', icon: MessageCircle },
                  { id: 'views', label: 'Most Viewed', icon: Eye }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSortBy(id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      sortBy === id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tag or Search Pill */}
            {(selectedTag || searchQuery) && (
              <div className="flex items-center gap-2">
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold border border-brand-200">
                    Tag: #{selectedTag}
                    <button onClick={() => setSelectedTag(null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Discovering latest stories...</p>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No articles found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                We couldn't find any articles matching your search or category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => fetchPosts(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    pagination.page === pageNum
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Platform Summary Stats */}
          {stats && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-400 mb-4">
                <Sparkles className="w-4 h-4" />
                <span>StoryFlow Platform</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-2xl font-black text-white">{stats.posts}</span>
                  <p className="text-[11px] text-slate-400">Published Posts</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">{stats.users}</span>
                  <p className="text-[11px] text-slate-400">Active Writers</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">{stats.views}</span>
                  <p className="text-[11px] text-slate-400">Total Reads</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">{stats.comments}</span>
                  <p className="text-[11px] text-slate-400">Discussions</p>
                </div>
              </div>
            </div>
          )}

          {/* Featured Writers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Featured Authors</span>
              </h3>
            </div>
            <div className="space-y-4">
              {authors.slice(0, 4).map((author) => (
                <div
                  key={author.id}
                  onClick={() => onNavigate('profile', author.username)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition">
                        {author.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[150px]">
                        {author.bio || `@${author.username}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {author.posts_count} {author.posts_count === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Topics / Tags */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>Trending Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {['nodejs', 'express', 'api', 'architecture', 'rag', 'llm', 'css', 'design', 'kubernetes', 'cleancode', 'accessibility'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedTag === tag
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

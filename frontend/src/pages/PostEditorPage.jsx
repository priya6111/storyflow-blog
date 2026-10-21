import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import {
  PenSquare,
  Image,
  Tag,
  Folder,
  Eye,
  Edit,
  ArrowLeft,
  Sparkles,
  Bold,
  Italic,
  Code,
  Quote,
  List,
  Heading,
  Check,
  X
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Code & Dev', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80' },
  { label: 'AI & Data', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
  { label: 'UI/UX Design', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Cloud & Infra', url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80' }
];

export function PostEditorPage({ postId, onNavigate }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const isEditing = !!postId;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [customCategory, setCustomCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  // If editing, fetch current post data
  useEffect(() => {
    if (isEditing) {
      async function loadPostToEdit() {
        try {
          setIsLoading(true);
          const res = await api.posts.getBySlugOrId(postId);
          if (res.success && res.post) {
            const p = res.post;
            // Check authorization
            if (user && p.author.id !== user.id && user.role !== 'admin') {
              addToast('You do not have permission to edit this post', 'error');
              onNavigate('home');
              return;
            }

            setTitle(p.title);
            setCategory(p.category);
            setCoverImage(p.cover_image || '');
            setExcerpt(p.excerpt || '');
            setContent(p.content || '');
            setTags(p.tags || []);
          }
        } catch (err) {
          addToast('Failed to load post for editing', 'error');
          onNavigate('home');
        } finally {
          setIsLoading(false);
        }
      }

      loadPostToEdit();
    }
  }, [postId, isEditing]);

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
        <PenSquare className="w-12 h-12 text-brand-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Write on StoryFlow</h2>
        <p className="text-xs text-slate-600 mb-6">
          You must be signed in to create and publish articles.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (val && !tags.includes(val) && tags.length < 8) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('post-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter an article title', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Article content cannot be empty', 'error');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    const payload = {
      title: title.trim(),
      category: finalCategory,
      tags,
      cover_image: coverImage.trim() || COVER_PRESETS[0].url,
      excerpt: excerpt.trim() || undefined,
      content: content.trim()
    };

    try {
      setIsSubmitting(true);
      if (isEditing) {
        const res = await api.posts.update(postId, payload);
        if (res.success && res.post) {
          addToast('Post updated successfully!', 'success');
          onNavigate('post', res.post.slug || res.post.id);
        }
      } else {
        const res = await api.posts.create(payload);
        if (res.success && res.post) {
          addToast('Article published successfully!', 'success');
          onNavigate('post', res.post.slug || res.post.id);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <button
          onClick={() => onNavigate(isEditing ? 'post' : 'home', postId)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {wordCount} words · {estimatedReadTime} min read
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish Story'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title..."
            className="w-full text-3xl sm:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 leading-tight"
          />
        </div>

        {/* Metadata Controls Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-brand-600" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Web Dev">Web Dev</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="UI & UX Design">UI & UX Design</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Custom">Custom Category...</option>
            </select>

            {category === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name"
                className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              <span>Tags (Press Enter to add)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-semibold text-[11px] border border-brand-200"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-brand-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'e.g. react, nodejs' : ''}
                className="flex-1 bg-transparent border-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none px-2 py-0.5 min-w-[80px]"
              />
            </div>
          </div>

          {/* Cover Image URL & Presets */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-brand-600" />
              <span>Cover Image URL (or pick a preset below)</span>
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
            />
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    coverImage === preset.url
                      ? 'bg-brand-50 border-brand-400 text-brand-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Summary / Excerpt (Optional)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence overview shown in feeds..."
              maxLength={200}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Content Section: Tabs & Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Bar with Write / Preview tabs & formatting buttons */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'write'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Write (Markdown)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Quick Markdown Toolbar */}
            {activeTab === 'write' && (
              <div className="flex items-center gap-1 text-slate-600">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Heading"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```javascript\n', '\n```')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 hover:bg-slate-200 rounded"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'write' ? (
            <textarea
              id="post-content-textarea"
              required
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story... Use Markdown for headings, code blocks, and rich text."
              className="w-full p-5 text-base text-slate-800 placeholder:text-slate-300 font-serif-reading leading-relaxed focus:outline-none resize-y border-none"
            />
          ) : (
            <div className="p-8 min-h-[450px] bg-white">
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-slate-400 text-sm italic">Nothing to preview yet. Start writing in the editor tab!</p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

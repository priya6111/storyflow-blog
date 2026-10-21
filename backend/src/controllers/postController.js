import db from '../db/database.js';

// Generate clean URL slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Calculate reading time in minutes
function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Format post item with author and counters
function formatPost(rawPost, currentUserId = null) {
  if (!rawPost) return null;

  let tags = [];
  try {
    tags = typeof rawPost.tags === 'string' ? JSON.parse(rawPost.tags) : rawPost.tags || [];
  } catch (e) {
    tags = rawPost.tags ? rawPost.tags.split(',').map(t => t.trim()) : [];
  }

  // Count likes
  const likesCountRow = db.prepare('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?').get(rawPost.id);
  const likesCount = likesCountRow ? likesCountRow.count : 0;

  // Count comments
  const commentsCountRow = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(rawPost.id);
  const commentsCount = commentsCountRow ? commentsCountRow.count : 0;

  // Check if current user liked
  let isLiked = false;
  let isBookmarked = false;

  if (currentUserId) {
    const likeCheck = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(rawPost.id, currentUserId);
    isLiked = !!likeCheck;

    const bookmarkCheck = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(rawPost.id, currentUserId);
    isBookmarked = !!bookmarkCheck;
  }

  return {
    id: rawPost.id,
    title: rawPost.title,
    slug: rawPost.slug,
    excerpt: rawPost.excerpt,
    content: rawPost.content,
    cover_image: rawPost.cover_image,
    category: rawPost.category,
    tags,
    read_time: rawPost.read_time,
    views: rawPost.views,
    created_at: rawPost.created_at,
    updated_at: rawPost.updated_at,
    author: {
      id: rawPost.author_id,
      name: rawPost.author_name,
      username: rawPost.author_username,
      avatar: rawPost.author_avatar,
      bio: rawPost.author_bio,
      role: rawPost.author_role
    },
    likes_count: likesCount,
    comments_count: commentsCount,
    is_liked: isLiked,
    is_bookmarked: isBookmarked
  };
}

export const getPosts = (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      tag,
      author,
      sort = 'latest'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const offset = (pageNum - 1) * limitNum;
    const currentUserId = req.user ? req.user.id : null;

    let whereConditions = [];
    let params = [];

    if (category && category !== 'All') {
      whereConditions.push('posts.category = ?');
      params.push(category);
    }

    if (tag) {
      whereConditions.push('posts.tags LIKE ?');
      params.push(`%"${tag}"%`);
    }

    if (author) {
      if (isNaN(author)) {
        whereConditions.push('users.username = ?');
        params.push(author);
      } else {
        whereConditions.push('posts.author_id = ?');
        params.push(parseInt(author, 10));
      }
    }

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions.push('(posts.title LIKE ? OR posts.excerpt LIKE ? OR posts.content LIKE ? OR posts.category LIKE ? OR posts.tags LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*) as total 
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      ${whereClause}
    `;
    const countResult = db.prepare(countSql).get(...params);
    const total = countResult ? countResult.total : 0;
    const totalPages = Math.ceil(total / limitNum);

    // Sorting
    let orderBy = 'posts.created_at DESC';
    if (sort === 'popular') {
      orderBy = '(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id) DESC, posts.created_at DESC';
    } else if (sort === 'views') {
      orderBy = 'posts.views DESC, posts.created_at DESC';
    } else if (sort === 'discussed') {
      orderBy = '(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) DESC, posts.created_at DESC';
    }

    const querySql = `
      SELECT 
        posts.*,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.bio as author_bio,
        users.role as author_role
      FROM posts
      JOIN users ON posts.author_id = users.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rawPosts = db.prepare(querySql).all(...params, limitNum, offset);
    const posts = rawPosts.map(p => formatPost(p, currentUserId));

    return res.json({
      success: true,
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('[Get Posts Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve posts',
      details: error.message
    });
  }
};

export const getPostBySlugOrId = (req, res) => {
  try {
    const { slugOrId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    let rawPost;
    if (!isNaN(slugOrId)) {
      rawPost = db.prepare(`
        SELECT 
          posts.*,
          users.name as author_name,
          users.username as author_username,
          users.avatar as author_avatar,
          users.bio as author_bio,
          users.role as author_role
        FROM posts
        JOIN users ON posts.author_id = users.id
        WHERE posts.id = ?
      `).get(parseInt(slugOrId, 10));
    }

    if (!rawPost) {
      rawPost = db.prepare(`
        SELECT 
          posts.*,
          users.name as author_name,
          users.username as author_username,
          users.avatar as author_avatar,
          users.bio as author_bio,
          users.role as author_role
        FROM posts
        JOIN users ON posts.author_id = users.id
        WHERE posts.slug = ?
      `).get(slugOrId);
    }

    if (!rawPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Increment views counter
    db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(rawPost.id);
    rawPost.views += 1;

    const post = formatPost(rawPost, currentUserId);

    return res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('[Get Post Detail Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve post details',
      details: error.message
    });
  }
};

export const createPost = (req, res) => {
  try {
    const { title, content, excerpt, category, tags, cover_image } = req.body;
    const authorId = req.user.id;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and category are required.'
      });
    }

    let baseSlug = slugify(title);
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    // Check slug collision
    let finalSlug = baseSlug;
    let collisionCheck = db.prepare('SELECT id FROM posts WHERE slug = ?').get(finalSlug);
    let counter = 1;
    while (collisionCheck) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      collisionCheck = db.prepare('SELECT id FROM posts WHERE slug = ?').get(finalSlug);
    }

    // Excerpt fallback: extract first 160 characters from markdown
    const finalExcerpt = excerpt && excerpt.trim()
      ? excerpt.trim()
      : content.replace(/[#*`_~\[\]]/g, '').slice(0, 160).trim() + '...';

    // Tags formatting
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.map(t => slugify(t)).filter(Boolean);
    } else if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => slugify(t)).filter(Boolean);
    }
    const tagsJson = JSON.stringify(tagsArray);

    const readTime = calculateReadTime(content);

    const defaultCover = cover_image && cover_image.trim()
      ? cover_image.trim()
      : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';

    const insert = db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, category, tags, read_time, views, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    const result = insert.run(
      title.trim(),
      finalSlug,
      finalExcerpt,
      content.trim(),
      defaultCover,
      category.trim(),
      tagsJson,
      readTime,
      authorId
    );

    const newPostId = Number(result.lastInsertRowid);
    const rawPost = db.prepare(`
      SELECT 
        posts.*,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.bio as author_bio,
        users.role as author_role
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE posts.id = ?
    `).get(newPostId);

    const post = formatPost(rawPost, authorId);

    return res.status(201).json({
      success: true,
      message: 'Post published successfully',
      post
    });
  } catch (error) {
    console.error('[Create Post Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create post',
      details: error.message
    });
  }
};

export const updatePost = (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, cover_image } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Permission check: only author or admin can update
    if (existingPost.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this post'
      });
    }

    const updates = [];
    const params = [];

    if (title && title.trim()) {
      updates.push('title = ?');
      params.push(title.trim());
    }

    if (content && content.trim()) {
      updates.push('content = ?');
      params.push(content.trim());

      const readTime = calculateReadTime(content);
      updates.push('read_time = ?');
      params.push(readTime);

      if (!excerpt) {
        const autoExcerpt = content.replace(/[#*`_~\[\]]/g, '').slice(0, 160).trim() + '...';
        updates.push('excerpt = ?');
        params.push(autoExcerpt);
      }
    }

    if (excerpt !== undefined) {
      updates.push('excerpt = ?');
      params.push(excerpt.trim());
    }

    if (category && category.trim()) {
      updates.push('category = ?');
      params.push(category.trim());
    }

    if (tags !== undefined) {
      let tagsArray = [];
      if (Array.isArray(tags)) {
        tagsArray = tags.map(t => slugify(t)).filter(Boolean);
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(t => slugify(t)).filter(Boolean);
      }
      updates.push('tags = ?');
      params.push(JSON.stringify(tagsArray));
    }

    if (cover_image !== undefined) {
      updates.push('cover_image = ?');
      params.push(cover_image.trim());
    }

    updates.push("updated_at = datetime('now')");

    params.push(id);
    const sql = `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);

    const updatedRawPost = db.prepare(`
      SELECT 
        posts.*,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.bio as author_bio,
        users.role as author_role
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE posts.id = ?
    `).get(id);

    const post = formatPost(updatedRawPost, userId);

    return res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('[Update Post Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update post',
      details: error.message
    });
  }
};

export const deletePost = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Permission check
    if (post.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this post'
      });
    }

    // Delete post (cascading deletes comments, likes, bookmarks)
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: 'Post and associated data deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Post Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete post',
      details: error.message
    });
  }
};

export const toggleLikePost = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingLike = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(id, userId);

    let liked = false;
    if (existingLike) {
      db.prepare('DELETE FROM post_likes WHERE id = ?').run(existingLike.id);
      liked = false;
    } else {
      db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(id, userId);
      liked = true;
    }

    const likesCountRow = db.prepare('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?').get(id);

    return res.json({
      success: true,
      liked,
      likes_count: likesCountRow ? likesCountRow.count : 0
    });
  } catch (error) {
    console.error('[Toggle Like Post Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle like',
      details: error.message
    });
  }
};

export const toggleBookmarkPost = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingBookmark = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(id, userId);

    let bookmarked = false;
    if (existingBookmark) {
      db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existingBookmark.id);
      bookmarked = false;
    } else {
      db.prepare('INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)').run(id, userId);
      bookmarked = true;
    }

    return res.json({
      success: true,
      bookmarked
    });
  } catch (error) {
    console.error('[Toggle Bookmark Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark',
      details: error.message
    });
  }
};

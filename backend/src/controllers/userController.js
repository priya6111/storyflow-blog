import db from '../db/database.js';

export const getUserProfile = (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = db.prepare(`
      SELECT id, username, email, name, avatar, bio, role, created_at
      FROM users
      WHERE LOWER(username) = LOWER(?)
    `).get(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Stats
    const postCountRow = db.prepare('SELECT COUNT(*) as count FROM posts WHERE author_id = ?').get(user.id);
    const postCount = postCountRow ? postCountRow.count : 0;

    const totalLikesRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM post_likes
      JOIN posts ON post_likes.post_id = posts.id
      WHERE posts.author_id = ?
    `).get(user.id);
    const totalLikes = totalLikesRow ? totalLikesRow.count : 0;

    const totalCommentsRow = db.prepare('SELECT COUNT(*) as count FROM comments WHERE author_id = ?').get(user.id);
    const totalComments = totalCommentsRow ? totalCommentsRow.count : 0;

    // Get user's posts
    const rawPosts = db.prepare(`
      SELECT 
        posts.*,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.bio as author_bio,
        users.role as author_role
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE posts.author_id = ?
      ORDER BY posts.created_at DESC
    `).all(user.id);

    const posts = rawPosts.map(p => {
      let tags = [];
      try {
        tags = JSON.parse(p.tags);
      } catch (e) {
        tags = [];
      }

      const likes = db.prepare('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?').get(p.id)?.count || 0;
      const comments = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(p.id)?.count || 0;

      let isLiked = false;
      let isBookmarked = false;
      if (currentUserId) {
        isLiked = !!db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(p.id, currentUserId);
        isBookmarked = !!db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(p.id, currentUserId);
      }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        cover_image: p.cover_image,
        category: p.category,
        tags,
        read_time: p.read_time,
        views: p.views,
        created_at: p.created_at,
        updated_at: p.updated_at,
        author: {
          id: p.author_id,
          name: p.author_name,
          username: p.author_username,
          avatar: p.author_avatar,
          bio: p.author_bio,
          role: p.author_role
        },
        likes_count: likes,
        comments_count: comments,
        is_liked: isLiked,
        is_bookmarked: isBookmarked
      };
    });

    return res.json({
      success: true,
      user,
      stats: {
        posts: postCount,
        likes: totalLikes,
        comments: totalComments
      },
      posts
    });
  } catch (error) {
    console.error('[Get User Profile Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
      details: error.message
    });
  }
};

export const getUserBookmarks = (req, res) => {
  try {
    const userId = req.user.id;

    const rawPosts = db.prepare(`
      SELECT 
        posts.*,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.bio as author_bio,
        users.role as author_role
      FROM bookmarks
      JOIN posts ON bookmarks.post_id = posts.id
      JOIN users ON posts.author_id = users.id
      WHERE bookmarks.user_id = ?
      ORDER BY bookmarks.created_at DESC
    `).all(userId);

    const posts = rawPosts.map(p => {
      let tags = [];
      try {
        tags = JSON.parse(p.tags);
      } catch (e) {
        tags = [];
      }

      const likes = db.prepare('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?').get(p.id)?.count || 0;
      const comments = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(p.id)?.count || 0;
      const isLiked = !!db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(p.id, userId);

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        cover_image: p.cover_image,
        category: p.category,
        tags,
        read_time: p.read_time,
        views: p.views,
        created_at: p.created_at,
        updated_at: p.updated_at,
        author: {
          id: p.author_id,
          name: p.author_name,
          username: p.author_username,
          avatar: p.author_avatar,
          bio: p.author_bio,
          role: p.author_role
        },
        likes_count: likes,
        comments_count: comments,
        is_liked: isLiked,
        is_bookmarked: true
      };
    });

    return res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('[Get Bookmarks Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve bookmarks',
      details: error.message
    });
  }
};

export const getAuthors = (req, res) => {
  try {
    const authors = db.prepare(`
      SELECT 
        users.id,
        users.name,
        users.username,
        users.avatar,
        users.bio,
        users.role,
        COUNT(DISTINCT posts.id) as posts_count
      FROM users
      LEFT JOIN posts ON users.id = posts.author_id
      GROUP BY users.id
      ORDER BY posts_count DESC
      LIMIT 10
    `).all();

    return res.json({
      success: true,
      authors
    });
  } catch (error) {
    console.error('[Get Authors Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve authors',
      details: error.message
    });
  }
};

import db from '../db/database.js';

export const getCategories = (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        category,
        COUNT(*) as count
      FROM posts
      GROUP BY category
      ORDER BY count DESC
    `).all();

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('[Get Categories Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories',
      details: error.message
    });
  }
};

export const getPlatformStats = (req, res) => {
  try {
    const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get()?.count || 0;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const totalComments = db.prepare('SELECT COUNT(*) as count FROM comments').get()?.count || 0;
    const totalViews = db.prepare('SELECT SUM(views) as count FROM posts').get()?.count || 0;
    const totalLikes = db.prepare('SELECT COUNT(*) as count FROM post_likes').get()?.count || 0;

    return res.json({
      success: true,
      stats: {
        posts: totalPosts,
        users: totalUsers,
        comments: totalComments,
        views: totalViews,
        likes: totalLikes
      }
    });
  } catch (error) {
    console.error('[Get Platform Stats Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve platform stats',
      details: error.message
    });
  }
};

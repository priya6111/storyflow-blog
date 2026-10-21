import db from '../db/database.js';

export const getComments = (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const postCheck = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!postCheck) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comments = db.prepare(`
      SELECT 
        comments.id,
        comments.post_id,
        comments.content,
        comments.created_at,
        comments.updated_at,
        users.id as author_id,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.role as author_role,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = comments.id) as likes_count
      FROM comments
      JOIN users ON comments.author_id = users.id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
    `).all(postId);

    const formattedComments = comments.map(c => {
      let isLiked = false;
      if (currentUserId) {
        const likeCheck = db.prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?').get(c.id, currentUserId);
        isLiked = !!likeCheck;
      }

      return {
        id: c.id,
        post_id: c.post_id,
        content: c.content,
        created_at: c.created_at,
        updated_at: c.updated_at,
        likes_count: c.likes_count,
        is_liked: isLiked,
        author: {
          id: c.author_id,
          name: c.author_name,
          username: c.author_username,
          avatar: c.author_avatar,
          role: c.author_role
        }
      };
    });

    return res.json({
      success: true,
      comments: formattedComments
    });
  } catch (error) {
    console.error('[Get Comments Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve comments',
      details: error.message
    });
  }
};

export const createComment = (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment content cannot be empty.'
      });
    }

    const postCheck = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!postCheck) {
      return res.status(404).json({
        success: false,
        error: 'Post not found.'
      });
    }

    const insert = db.prepare(`
      INSERT INTO comments (post_id, author_id, content)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(postId, authorId, content.trim());
    const commentId = Number(result.lastInsertRowid);

    const rawComment = db.prepare(`
      SELECT 
        comments.id,
        comments.post_id,
        comments.content,
        comments.created_at,
        comments.updated_at,
        users.id as author_id,
        users.name as author_name,
        users.username as author_username,
        users.avatar as author_avatar,
        users.role as author_role
      FROM comments
      JOIN users ON comments.author_id = users.id
      WHERE comments.id = ?
    `).get(commentId);

    const comment = {
      id: rawComment.id,
      post_id: rawComment.post_id,
      content: rawComment.content,
      created_at: rawComment.created_at,
      updated_at: rawComment.updated_at,
      likes_count: 0,
      is_liked: false,
      author: {
        id: rawComment.author_id,
        name: rawComment.author_name,
        username: rawComment.author_username,
        avatar: rawComment.author_avatar,
        role: rawComment.author_role
      }
    };

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      comment
    });
  } catch (error) {
    console.error('[Create Comment Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to post comment',
      details: error.message
    });
  }
};

export const deleteComment = (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = db.prepare(`
      SELECT comments.id, comments.author_id, posts.author_id as post_author_id
      FROM comments
      JOIN posts ON comments.post_id = posts.id
      WHERE comments.id = ?
    `).get(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Allowed: Comment author, Post author, or Admin
    if (comment.author_id !== userId && comment.post_author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this comment'
      });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    return res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Comment Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      details: error.message
    });
  }
};

export const toggleLikeComment = (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = db.prepare('SELECT id FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const existingLike = db.prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?').get(commentId, userId);

    let liked = false;
    if (existingLike) {
      db.prepare('DELETE FROM comment_likes WHERE id = ?').run(existingLike.id);
      liked = false;
    } else {
      db.prepare('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)').run(commentId, userId);
      liked = true;
    }

    const likesCountRow = db.prepare('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?').get(commentId);

    return res.json({
      success: true,
      liked,
      likes_count: likesCountRow ? likesCountRow.count : 0
    });
  } catch (error) {
    console.error('[Toggle Like Comment Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle comment like',
      details: error.message
    });
  }
};

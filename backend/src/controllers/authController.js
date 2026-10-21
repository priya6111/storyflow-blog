import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, name, avatar, bio } = req.body;

    // Validation
    if (!username || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: username, email, password, and name.'
      });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long and alphanumeric.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Username or email is already registered.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;

    const insert = db.prepare(`
      INSERT INTO users (username, email, password, name, avatar, bio, role)
      VALUES (?, ?, ?, ?, ?, ?, 'author')
    `);

    const result = insert.run(
      cleanUsername,
      cleanEmail,
      hashedPassword,
      name.trim(),
      defaultAvatar,
      bio ? bio.trim() : 'Blogger and technology enthusiast.'
    );

    const newUser = db.prepare('SELECT id, username, email, name, avatar, bio, role, created_at FROM users WHERE id = ?').get(Number(result.lastInsertRowid));

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register user',
      details: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username/email and password.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?
    `).get(cleanIdentifier, cleanIdentifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.'
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

export const getCurrentUser = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

export const updateProfile = (req, res) => {
  try {
    const { name, avatar, bio } = req.body;
    const userId = req.user.id;

    const updates = [];
    const params = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (avatar && avatar.trim()) {
      updates.push('avatar = ?');
      params.push(avatar.trim());
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid profile fields provided for update.'
      });
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);

    const updatedUser = db.prepare('SELECT id, username, email, name, avatar, bio, role, created_at FROM users WHERE id = ?').get(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      details: error.message
    });
  }
};

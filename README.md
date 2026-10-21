# StoryFlow — Full-Stack Blog Platform with Comments & Authentication

A blogging and content publishing platform built with a RESTful Express backend, SQLite relational database, and a React 18 + Tailwind CSS frontend.

---

## 🌟 Key Features

### 1. User Registration, Authentication & Profiles
- **JWT-Based Authentication**: Secure stateless tokens with bcrypt password hashing.
- **User Registration & Login**: Support for usernames, emails, full names, bios, and avatars.
- **Demo Quick-Login**: 1-click login buttons for instant evaluation with pre-seeded accounts:
  - `alexjohnson` (Staff Engineer & Admin)
  - `sarahchen` (AI Researcher)
  - `marcusbrody` (Design Systems Architect)
  - `priyasharma` (Cloud & DevOps Architect)
  - *Password for all demo accounts:* `password123`
- **User Profiles**: View author bios, total articles, total likes received, and comment activity.
- **Editable Profiles**: Update avatar, full name, and bio directly from the interface.

### 2. Blog Post Management (CRUD)
- **Create Post**: Title, category, tags, cover image (with high-res presets), estimated reading time calculation, and markdown content.
- **Read & Explore Feed**:
  - Featured story hero banner.
  - Category filter pills (`Web Dev`, `AI & Machine Learning`, `UI & UX Design`, `Cloud & DevOps`, `Software Engineering`).
  - Search by keyword, title, excerpt, content, or author.
  - Sorting by **Latest**, **Most Liked (Popular)**, **Most Discussed**, and **Most Viewed**.
  - Pagination controls.
- **Post Detail**:
  - Full article view with author card, category badge, and reading time.
  - Markdown renderer with formatted headings, blockquotes, lists, and syntax-highlighted code blocks with 1-click **Copy** button.
  - View counter automatically increments on read.
  - Post like / unlike with optimistic real-time counters.
  - Bookmarking to save articles into a personal reading list.
  - 1-click article link sharing.
- **Edit & Delete Post**: Authors and Admins can update content or delete posts with confirmation dialogs.

### 3. Interactive Comment System
- **Real-Time Commenting**: Add comments to any post with author attribution and relative timestamps ("2h ago", "Just now").
- **Author Badge**: Comments written by the post's author are highlighted with a distinct "Author" badge.
- **Comment Likes**: Upvote insightful comments with like counters.
- **Comment Deletion**: Authors of comments, post owners, and admins can delete comments with confirmation.
- **Guest Prompts**: Unauthenticated visitors receive an inviting prompt to sign in with 1 click to join discussions.

### 4. Database & Relational Data Integrity
- **Native SQLite**: Zero external database server configuration required. High-speed WAL mode with foreign key cascade deletions.
- **Relational Tables**:
  - `users` (id, username, email, password, name, avatar, bio, role, created_at)
  - `posts` (id, title, slug, excerpt, content, cover_image, category, tags, read_time, views, author_id, created_at, updated_at)
  - `comments` (id, post_id, author_id, content, created_at, updated_at)
  - `post_likes` (id, post_id, user_id, created_at)
  - `comment_likes` (id, comment_id, user_id, created_at)
  - `bookmarks` (id, post_id, user_id, created_at)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18, v20, or v22+)
- npm

### 1. Run Everything with One Command
From the project root:
```bash
npm run dev
```
This runs `start-dev.js`, starting both:
- **Backend API Server**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### 2. Manual Start (Separate Terminals)

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Re-seed Demo Data
If you ever want to reset or repopulate the database with fresh sample articles:
```bash
npm run seed
```

---

## 📡 RESTful API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | System and database health status |
| **POST** | `/api/auth/register` | Public | Register new user account |
| **POST** | `/api/auth/login` | Public | Authenticate user and issue JWT |
| **GET** | `/api/auth/me` | Auth | Get current authenticated user profile |
| **PUT** | `/api/auth/profile` | Auth | Update user profile details |
| **GET** | `/api/posts` | Public | Fetch paginated posts with search/filter/sort |
| **GET** | `/api/posts/:slugOrId`| Public | Get post details and increment views |
| **POST** | `/api/posts` | Auth | Create a new blog post |
| **PUT** | `/api/posts/:id` | Auth | Update existing blog post (Author/Admin) |
| **DELETE**| `/api/posts/:id` | Auth | Delete post and associated comments/likes |
| **POST** | `/api/posts/:id/like` | Auth | Toggle like on blog post |
| **POST** | `/api/posts/:id/bookmark`| Auth | Toggle bookmark on post |
| **GET** | `/api/posts/:id/comments`| Public | Get all comments for a post |
| **POST** | `/api/posts/:id/comments`| Auth | Add a new comment |
| **DELETE**| `/api/comments/:id` | Auth | Delete a comment |
| **POST** | `/api/comments/:id/like` | Auth | Toggle like on a comment |
| **GET** | `/api/categories` | Public | List categories with post counts |
| **GET** | `/api/categories/stats` | Public | Platform-wide aggregate metrics |
| **GET** | `/api/users/authors` | Public | List top authors |
| **GET** | `/api/users/bookmarks` | Auth | Get current user's reading list |
| **GET** | `/api/users/:username` | Public | Get author profile, stats, and their posts |

---

## 🧪 Automated Testing
Run the automated test suite verifying all 14 endpoints:
```bash
node test-api.js
```
Expected output:
```text
🎉 ALL 14 TEST SUITES PASSED FLAWLESSLY!
   - User Registration, Login & JWT Auth: ✅
   - Full Blog CRUD Operations:           ✅
   - Comment System & Likes:              ✅
   - Bookmarking & Platform Stats:        ✅
   - SQLite Relational Database Engine:   ✅
```

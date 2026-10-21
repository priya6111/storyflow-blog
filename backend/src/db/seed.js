import bcrypt from 'bcryptjs';
import db, { initDB } from './database.js';

export async function seedDatabase(force = false) {
  initDB();

  // Check if users exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers && existingUsers.count > 0 && !force) {
    console.log('[Seed] Database already contains data. Skipping seeding.');
    return;
  }

  if (force) {
    console.log('[Seed] Clearing existing tables...');
    db.exec('DELETE FROM bookmarks');
    db.exec('DELETE FROM comment_likes');
    db.exec('DELETE FROM post_likes');
    db.exec('DELETE FROM comments');
    db.exec('DELETE FROM posts');
    db.exec('DELETE FROM users');
  }

  console.log('[Seed] Seeding sample data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, name, avatar, bio, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const usersData = [
    {
      username: 'alexjohnson',
      email: 'alex@storyflow.dev',
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Staff Full-Stack Engineer & Open Source Advocate. Writes about Node.js, distributed systems, and modern web architectures.',
      role: 'admin'
    },
    {
      username: 'sarahchen',
      email: 'sarah@storyflow.dev',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      bio: 'AI Researcher & ML Engineer exploring agentic workflows, embeddings, and next-gen reasoning models.',
      role: 'author'
    },
    {
      username: 'marcusbrody',
      email: 'marcus@storyflow.dev',
      name: 'Marcus Brody',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Design Systems Architect & frontend craftsman. Passionate about typography, subgrid, and delightful animations.',
      role: 'author'
    },
    {
      username: 'priyasharma',
      email: 'priya@storyflow.dev',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      bio: 'Cloud Architect & DevOps specialist. Helping teams deploy resilient microservices with Kubernetes & Terraform.',
      role: 'author'
    }
  ];

  const userIds = [];
  for (const u of usersData) {
    const res = insertUser.run(u.username, u.email, passwordHash, u.name, u.avatar, u.bio, u.role);
    userIds.push(Number(res.lastInsertRowid));
  }

  // 2. Insert Posts
  const insertPost = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, content, cover_image, category, tags, read_time, views, author_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const postsData = [
    {
      title: 'Building Scalable RESTful APIs with Node.js and Clean Architecture',
      slug: 'building-scalable-restful-apis-nodejs-clean-architecture',
      excerpt: 'Discover practical patterns for organizing routes, controllers, services, and database layers to build resilient Express applications that scale effortlessly.',
      category: 'Web Dev',
      tags: JSON.stringify(['nodejs', 'express', 'api', 'architecture', 'backend']),
      cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      read_time: 6,
      views: 342,
      author_id: userIds[0],
      offset: '-3 days',
      content: `## Why Architecture Matters in Backend Development

When teams start a new Express or Node.js project, it is tempting to dump all handler logic directly inside route callbacks. For simple prototypes, this works fine. But as requirements grow—adding authentication, database migrations, rate limiting, and third-party webhook handling—unstructured code quickly turns into an unmaintainable maze.

In this guide, we'll explore **Clean Architecture** patterns specifically tailored for Node.js REST services.

---

### 1. Separation of Concerns

A resilient API should separate responsibilities into distinct layers:

1. **Routes Layer**: Handles HTTP method binding, path definitions, and middleware attachment.
2. **Controllers Layer**: Parses HTTP request parameters, validates payload formats, and translates business responses into status codes.
3. **Services / Domain Layer**: Contains pure business logic, calculations, and rules. It does not know about HTTP requests or Express \`req\` / \`res\`.
4. **Data Access Layer**: Communicates with the database, performs queries, and manages database transactions.

\`\`\`javascript
// Example: Controller isolating business logic from HTTP transport
export async function createPostController(req, res, next) {
  try {
    const { title, content, category, tags } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await PostService.create({
      title,
      content,
      category,
      tags,
      authorId
    });

    return res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
}
\`\`\`

---

### 2. Standardizing API Responses

Consistent JSON structure saves frontend developers hours of parsing edge cases. Every endpoint should follow a predictable schema:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
\`\`\`

In error scenarios:

\`\`\`json
{
  "success": false,
  "error": "Resource not found",
  "details": []
}
\`\`\`

---

### 3. Graceful Error Handling & Middleware

Never leak raw stack traces to production clients. Implement a centralized error-handling middleware at the very end of your Express middleware chain:

\`\`\`javascript
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error('[Error caught]', err.stack);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
\`\`\`

By adhering to these boundaries, your REST APIs will remain maintainable, testable, and pleasant to develop for years to come.`
    },
    {
      title: 'The Practical Guide to Retrieval-Augmented Generation (RAG) in 2026',
      slug: 'practical-guide-retrieval-augmented-generation-rag-2026',
      excerpt: 'Learn how vector embeddings, semantic search, and hybrid ranking algorithms connect proprietary knowledge bases to modern large language models.',
      category: 'AI & Machine Learning',
      tags: JSON.stringify(['ai', 'rag', 'llm', 'vectors', 'python']),
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      read_time: 8,
      views: 520,
      author_id: userIds[1],
      offset: '-2 days',
      content: `## Beyond Fine-Tuning: Why RAG Dominates Enterprise AI

When building domain-specific AI assistants, developers often debate between fine-tuning a model and implementing **Retrieval-Augmented Generation (RAG)**.

While fine-tuning teaches a model *how* to talk or write in a particular style, RAG provides the model with *accurate, up-to-the-minute facts*.

---

### The Three Core Pillars of RAG

1. **Document Ingestion & Chunking**: Dividing long PDFs, Markdown files, or documentation into semantically meaningful pieces.
2. **Dense Vector Embeddings**: Transforming text chunks into high-dimensional numerical vectors that capture conceptual relationships.
3. **Hybrid Retrieval & Prompt Synthesis**: Combining BM25 keyword search with dense cosine similarity, then injecting the retrieved context directly into the prompt.

\`\`\`python
# Conceptual Hybrid Search Pipeline
def retrieve_relevant_context(query: str, top_k: int = 5):
    keyword_results = bm25_search(query, top_k=top_k)
    semantic_results = vector_index.similarity_search(query, top_k=top_k)
    
    # Reciprocal Rank Fusion (RRF)
    fused_docs = reciprocal_rank_fusion([keyword_results, semantic_results])
    return fused_docs[:top_k]
\`\`\`

---

### Mitigating Hallucinations

By grounding answers strictly in retrieved excerpts and asking the model to cite sources, hallucination rates drop by over 80%. RAG also enables real-time document updates without expensive GPU retraining.`
    },
    {
      title: 'Mastering Modern CSS: Container Queries, Subgrid, and Fluid Typography',
      slug: 'mastering-modern-css-container-queries-subgrid-fluid-typography',
      excerpt: 'Say goodbye to rigid viewport media queries. Container queries and CSS Grid subgrid unlock true component-driven responsive layouts.',
      category: 'UI & UX Design',
      tags: JSON.stringify(['css', 'frontend', 'design', 'responsive', 'web']),
      cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      read_time: 5,
      views: 289,
      author_id: userIds[2],
      offset: '-1 day',
      content: `## The Evolution of Responsive Design

For over a decade, responsive web design meant querying the browser viewport width via \`@media (min-width: 768px)\`. 

While revolutionary in 2011, viewport queries fail in modular component architectures. A card component might be displayed in a narrow sidebar or in a full-width hero grid. The component shouldn't care about screen size; it should care about the **width of its own parent container**.

---

### Enter Container Queries

\`\`\`css
.card-container {
  container-type: inline-size;
  container-name: article-card;
}

@container article-card (min-width: 480px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1.5rem;
  }
}
\`\`\`

With just these lines, our card seamlessly switches from a stacked mobile view to a horizontal layout whenever its container expands!

---

### Aligning Nested Content with CSS Subgrid

Nested cards often have titles and buttons that misalign across columns. With \`grid-template-rows: subgrid\`, sibling elements align across separate cards flawlessly without hacks.`
    },
    {
      title: 'Zero to Production: Kubernetes & Microservices Best Practices',
      slug: 'zero-to-production-kubernetes-microservices-best-practices',
      excerpt: 'A battle-tested blueprint for configuring Ingress, horizontal pod autoscaling, health checks, and secrets management in production clusters.',
      category: 'Cloud & DevOps',
      tags: JSON.stringify(['kubernetes', 'docker', 'devops', 'cloud', 'containers']),
      cover_image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80',
      read_time: 7,
      views: 410,
      author_id: userIds[3],
      offset: '-18 hours',
      content: `## The Reality of Running Kubernetes in Production

Deploying an application to a local Minikube cluster is straightforward. But operating microservices at scale requires strict governance around resource allocation, rolling rollouts, and observability.

---

### Essential Configuration Checklist

- **Liveness and Readiness Probes**: Ensure traffic is only routed when your application has finished booting and establishing database connections.
- **Resource Requests & Limits**: Never omit CPU and memory requests; without them, the kube-scheduler cannot properly balance node workloads.
- **Graceful Shutdown**: Intercept \`SIGTERM\`, stop accepting new requests, and complete active connections within 30 seconds.

\`\`\`yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 20
\`\`\`

Implementing proper probes and limits guarantees high availability and zero downtime during continuous delivery deployments.`
    },
    {
      title: 'Why Clean Code Still Matters in the Age of Generative AI',
      slug: 'why-clean-code-still-matters-in-age-of-generative-ai',
      excerpt: 'AI code assistants can generate hundreds of lines of code in seconds. Here is why readability, type safety, and domain modeling are more crucial than ever.',
      category: 'Software Engineering',
      tags: JSON.stringify(['cleancode', 'productivity', 'softwareengineering', 'ai']),
      cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      read_time: 4,
      views: 615,
      author_id: userIds[0],
      offset: '-10 hours',
      content: `## Fast Generation vs. Maintainable Systems

With the rise of code generation models, writing code has never been faster. However, software engineering has never primarily been about typing speed—it has always been about **understanding, reading, debugging, and evolving code over time**.

---

### The Code Review Challenge

When an engineer accepts a 200-line generated pull request without comprehending edge conditions, technical debt accumulates rapidly.

Clean code principles provide:
- **Predictable mental models**: Clear function names like \`calculateOrderDiscount()\` instead of ambiguous helpers.
- **Idempotency and testability**: Functions without hidden side effects.
- **Maintainable context**: Well-named domain entities that future AI tools and human collaborators can reason about without confusion.`
    },
    {
      title: 'Designing Accessible Web Components from Scratch',
      slug: 'designing-accessible-web-components-from-scratch',
      excerpt: 'Step-by-step breakdown of ARIA roles, keyboard navigation traps, focus rings, and screen-reader accessibility for interactive UI elements.',
      category: 'UI & UX Design',
      tags: JSON.stringify(['accessibility', 'a11y', 'webdev', 'components', 'ux']),
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      read_time: 5,
      views: 198,
      author_id: userIds[2],
      offset: '-3 hours',
      content: `## Accessibility is Not an Afterthought

Building an inclusive web means designing experiences that are operable by anyone, regardless of ability or input device.

---

### Key Requirements for Interactive Modals and Menus

1. **Keyboard Trap**: When a modal opens, focus must stay within the dialog until dismissed.
2. **Escape Key Dismissal**: Users should always be able to hit \`Esc\` to return to the previous view.
3. **Focus Restoration**: When the modal closes, focus should return to the button that triggered it.

\`\`\`javascript
// Handling Escape key listener
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
\`\`\`

Small, deliberate accessibility choices make our software truly universal.`
    }
  ];

  const postIds = [];
  for (const p of postsData) {
    const res = insertPost.run(
      p.title,
      p.slug,
      p.excerpt,
      p.content,
      p.cover_image,
      p.category,
      p.tags,
      p.read_time,
      p.views,
      p.author_id,
      p.offset
    );
    postIds.push(Number(res.lastInsertRowid));
  }

  // 3. Insert Comments
  const insertComment = db.prepare(`
    INSERT INTO comments (post_id, author_id, content, created_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `);

  const commentsData = [
    {
      postId: postIds[0],
      authorId: userIds[1],
      content: 'Fantastic breakdown, Alex! Separating the service layer from controllers has saved our team so much headache during refactors.',
      offset: '-2 days'
    },
    {
      postId: postIds[0],
      authorId: userIds[2],
      content: 'Especially love the section on standardizing API error responses. It makes client-side toast notifications and form error handling so much cleaner.',
      offset: '-1 day'
    },
    {
      postId: postIds[1],
      authorId: userIds[0],
      content: 'Hybrid search with Reciprocal Rank Fusion (RRF) is truly a game changer. We saw keyword-miss rates plummet in technical documentation queries.',
      offset: '-1 day'
    },
    {
      postId: postIds[1],
      authorId: userIds[3],
      content: 'Great overview, Sarah! Do you recommend Qdrant or pgvector for teams already running Postgres in production?',
      offset: '-12 hours'
    },
    {
      postId: postIds[2],
      authorId: userIds[1],
      content: 'Container queries have fundamentally changed how I think about responsive design systems. No more rigid screen-breakpoint media queries!',
      offset: '-6 hours'
    },
    {
      postId: postIds[3],
      authorId: userIds[0],
      content: 'Liveness vs readiness probes are so often misunderstood. Great callout on graceful shutdown handling with SIGTERM.',
      offset: '-2 hours'
    }
  ];

  const commentIds = [];
  for (const c of commentsData) {
    const res = insertComment.run(c.postId, c.authorId, c.content, c.offset);
    commentIds.push(Number(res.lastInsertRowid));
  }

  // 4. Insert Likes & Bookmarks
  const insertPostLike = db.prepare('INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)');
  const insertBookmark = db.prepare('INSERT OR IGNORE INTO bookmarks (post_id, user_id) VALUES (?, ?)');
  const insertCommentLike = db.prepare('INSERT OR IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)');

  // Post likes
  insertPostLike.run(postIds[0], userIds[1]);
  insertPostLike.run(postIds[0], userIds[2]);
  insertPostLike.run(postIds[0], userIds[3]);
  insertPostLike.run(postIds[1], userIds[0]);
  insertPostLike.run(postIds[1], userIds[2]);
  insertPostLike.run(postIds[2], userIds[0]);
  insertPostLike.run(postIds[2], userIds[1]);
  insertPostLike.run(postIds[3], userIds[0]);
  insertPostLike.run(postIds[4], userIds[1]);
  insertPostLike.run(postIds[4], userIds[2]);
  insertPostLike.run(postIds[5], userIds[0]);

  // Bookmarks
  insertBookmark.run(postIds[0], userIds[1]);
  insertBookmark.run(postIds[1], userIds[0]);
  insertBookmark.run(postIds[2], userIds[3]);

  // Comment likes
  insertCommentLike.run(commentIds[0], userIds[0]);
  insertCommentLike.run(commentIds[0], userIds[2]);
  insertCommentLike.run(commentIds[2], userIds[1]);

  console.log(`[Seed] Seeded ${usersData.length} users, ${postsData.length} posts, ${commentsData.length} comments.`);
}

// Run directly if invoked as script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true).then(() => {
    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  }).catch(err => {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  });
}

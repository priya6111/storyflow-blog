const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('storyflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`[API Error ${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getCurrentUser: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  },

  // Posts
  posts: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const qs = searchParams.toString();
      return request(`/posts${qs ? `?${qs}` : ''}`);
    },
    getBySlugOrId: (slugOrId) => request(`/posts/${slugOrId}`),
    create: (postData) => request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    }),
    update: (id, postData) => request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    }),
    delete: (id) => request(`/posts/${id}`, {
      method: 'DELETE'
    }),
    toggleLike: (id) => request(`/posts/${id}/like`, {
      method: 'POST'
    }),
    toggleBookmark: (id) => request(`/posts/${id}/bookmark`, {
      method: 'POST'
    })
  },

  // Comments
  comments: {
    getByPost: (postId) => request(`/posts/${postId}/comments`),
    create: (postId, content) => request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
    delete: (commentId) => request(`/comments/${commentId}`, {
      method: 'DELETE'
    }),
    toggleLike: (commentId) => request(`/comments/${commentId}/like`, {
      method: 'POST'
    })
  },

  // Users & Authors
  users: {
    getProfile: (username) => request(`/users/${username}`),
    getBookmarks: () => request('/users/bookmarks'),
    getAuthors: () => request('/users/authors')
  },

  // Categories & Stats
  categories: {
    getAll: () => request('/categories'),
    getStats: () => request('/categories/stats')
  }
};

// services/blog.js
const BASE_URL = 'http://127.0.0.1:8000/blogs/api/';

console.log('📝 Blog service initialized with BASE_URL:', BASE_URL);

const getToken = () => {
  return localStorage.getItem('access_token');
};

const getAuthHeaders = (isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const apiCall = async (endpoint, method = 'GET', data = null, requireAuth = false, isFormData = false) => {
  console.log(`📝 Blog API: ${method} ${endpoint}`);
  
  const headers = getAuthHeaders(isFormData);
  
  if (requireAuth && !headers['Authorization']) {
    throw new Error('Authentication required');
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    if (isFormData) {
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Something went wrong' }));
      const error = new Error(errorData.error || errorData.message || 'API request failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('📝 Blog API error:', error);
    throw error;
  }
};

const uploadFile = async (endpoint, formData, requireAuth = false) => {
  return apiCall(endpoint, 'POST', formData, requireAuth, true);
};

export const blogService = {
  // ==================== BLOG CRUD OPERATIONS ====================
  
  async getBlogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `blogs/?${queryString}` : 'blogs/';
    
    return await apiCall(endpoint, 'GET', null, false);
  },

  async getBlogById(id) {
    return await apiCall(`blogs/${id}/`, 'GET', null, false);
  },

  async getBlogBySlug(slug) {
    return await apiCall(`blogs/slug/${slug}/`, 'GET', null, false);
  },

  async createBlog(blogData) {
    return await apiCall('blogs/create/', 'POST', blogData, true);
  },

  async updateBlog(id, blogData, isPartial = false) {
    const method = isPartial ? 'PATCH' : 'PUT';
    return await apiCall(`blogs/${id}/update/`, method, blogData, true);
  },

  async deleteBlog(id) {
    return await apiCall(`blogs/${id}/delete/`, 'DELETE', null, true);
  },

  // ==================== BLOG ACTIONS ====================
  
  async publishBlog(id) {
    return await apiCall(`blogs/${id}/publish/`, 'POST', null, true);
  },

  async scheduleBlog(id, scheduledAt) {
    return await apiCall(`blogs/${id}/schedule/`, 'POST', { scheduled_publish_at: scheduledAt }, true);
  },

  async featureBlog(id) {
    return await apiCall(`blogs/${id}/feature/`, 'POST', null, true);
  },

  async incrementView(id) {
    return await apiCall(`blogs/${id}/increment-view/`, 'POST', null, false);
  },

  // ==================== BLOG COLLECTIONS ====================
  
  async getFeaturedBlogs() {
    return await apiCall('blogs/featured/', 'GET', null, false);
  },

  async getRecentBlogs() {
    return await apiCall('blogs/recent/', 'GET', null, false);
  },

  async getPopularBlogs() {
    return await apiCall('blogs/popular/', 'GET', null, false);
  },

  async getMyBlogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `blogs/my/?${queryString}` : 'blogs/my/';
    
    return await apiCall(endpoint, 'GET', null, true);
  },

  // ==================== STATISTICS AND ANALYSIS ====================
  
  async getBlogStats() {
    return await apiCall('blogs/stats/', 'GET', null, true);
  },

  async getSeoAnalysis(id) {
    return await apiCall(`blogs/${id}/seo-analysis/`, 'GET', null, true);
  },

  // ==================== BLOG IMAGES ====================
  
  async getBlogImages(blogId) {
    return await apiCall(`blogs/${blogId}/images/`, 'GET', null, false);
  },

  async createBlogImage(blogId, imageData) {
    const formData = new FormData();
    
    if (imageData.image) {
      formData.append('image', imageData.image);
    }
    
    if (imageData.alt_text) {
      formData.append('alt_text', imageData.alt_text);
    }
    
    if (imageData.order !== undefined) {
      formData.append('order', imageData.order);
    }
    
    return await uploadFile(`blogs/${blogId}/images/create/`, formData, true);
  },

  async deleteBlogImage(imageId) {
    return await apiCall(`blogs/images/${imageId}/delete/`, 'DELETE', null, true);
  },

  // ==================== BLOG VIEWS ANALYTICS ====================
  
  async getBlogViews(blogId, params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `blogs/${blogId}/views/?${queryString}` : `blogs/${blogId}/views/`;
    
    return await apiCall(endpoint, 'GET', null, true);
  },

  // ==================== SEARCH ====================
  
  async searchBlogs(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query });
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const endpoint = `blogs/search/?${queryParams.toString()}`;
    return await apiCall(endpoint, 'GET', null, false);
  },

  // ==================== EXPORT (Admin only) ====================
  
  async exportBlogs() {
    const response = await fetch(`${BASE_URL}blogs/export/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blogs_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },

  // ==================== HELPER METHODS ====================
  
  generateBlogFilters(params) {
    const filters = {};
    
    if (params.status) filters.status = params.status;
    if (params.type) filters.type = params.type;
    if (params.user_id) filters.user_id = params.user_id;
    if (params.is_featured !== undefined) filters.is_featured = params.is_featured;
    if (params.keyword) filters.keyword = params.keyword;
    if (params.order_by) filters.order_by = params.order_by;
    if (params.page) filters.page = params.page;
    if (params.page_size) filters.page_size = params.page_size;
    
    return filters;
  },

  generateViewFilters(params) {
    const filters = {};
    
    if (params.start_date) filters.start_date = params.start_date;
    if (params.end_date) filters.end_date = params.end_date;
    if (params.page) filters.page = params.page;
    if (params.page_size) filters.page_size = params.page_size;
    
    return filters;
  },

  // ==================== BLOG VALIDATION ====================
  
  validateBlogData(blogData) {
    const errors = {};
    
    if (!blogData.title || blogData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!blogData.body || blogData.body.trim().length < 100) {
      errors.body = 'Content must be at least 100 characters';
    }
    
    if (blogData.seo_title && (blogData.seo_title.length < 50 || blogData.seo_title.length > 60)) {
      errors.seo_title = 'SEO title should be 50-60 characters';
    }
    
    if (blogData.meta_description && (blogData.meta_description.length < 120 || blogData.meta_description.length > 160)) {
      errors.meta_description = 'Meta description should be 120-160 characters';
    }
    
    if (blogData.featured_image && !blogData.featured_image_alt) {
      errors.featured_image_alt = 'Alt text is required for featured image';
    }
    
    return errors;
  },

  // ==================== CONTENT HELPERS ====================
  
  calculateReadingTime(wordCount) {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  },

  extractExcerpt(content, length = 160) {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > length 
      ? plainText.substring(0, length) + '...'
      : plainText;
  },

  // ==================== FORMATTING ====================
  
  formatBlogForDisplay(blog) {
    return {
      ...blog,
      display_date: blog.published_at 
        ? new Date(blog.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Draft',
      reading_time_display: `${blog.reading_time_minutes || 5} min read`,
      share_url: typeof window !== 'undefined' 
        ? `${window.location.origin}/blog/${blog.slug}`
        : ''
    };
  },

  // ==================== IMAGE HELPERS ====================
  
  validateImageFile(file) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    if (file.size > maxSize) {
      errors.push('Image size must be less than 5MB');
    }
    
    return errors;
  },

  createImageFormData(file, altText = '', order = 0) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', altText);
    formData.append('order', order.toString());
    return formData;
  }
};

export const blogConstants = {
  STATUS_CHOICES: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'scheduled', label: 'Scheduled' }
  ],
  
  TYPE_CHOICES: [
    { value: 'white_paper', label: 'White Paper' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'blog', label: 'Blog' }
  ],
  
  SEARCH_INTENT_CHOICES: [
    { value: 'informational', label: 'Informational' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'transactional', label: 'Transactional' }
  ],
  
  ORDER_BY_OPTIONS: [
    { value: '-published_at', label: 'Newest First' },
    { value: 'published_at', label: 'Oldest First' },
    { value: '-view_count', label: 'Most Viewed' },
    { value: '-reading_time_minutes', label: 'Longest Read' },
    { value: 'reading_time_minutes', label: 'Shortest Read' }
  ]
};

// Helper function to check if user can edit blog
export const canEditBlog = (blog, currentUser) => {
  if (!currentUser) return false;
  
  return (
    currentUser.is_staff || 
    blog.user?.id === currentUser.id ||
    blog.user_id === currentUser.id
  );
};

// Helper function to check if user can view blog
export const canViewBlog = (blog, currentUser) => {
  if (blog.status === 'published') return true;
  
  if (!currentUser) return false;
  
  return (
    currentUser.is_staff || 
    blog.user?.id === currentUser.id ||
    blog.user_id === currentUser.id
  );
};

export default {
  ...blogService,
  blogConstants,
  canEditBlog,
  canViewBlog,
  BASE_URL
};
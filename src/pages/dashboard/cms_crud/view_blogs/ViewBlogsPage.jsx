import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Article as ArticleIcon,
  AccessTime,
  ThumbUp,
  CalendarToday,
  MoreVert,
  Warning,
  CheckCircle,
  Pending,
  Archive,
  Schedule as ScheduleIcon,
  Person,
  Refresh,
  Error as ErrorIcon,
  Add as AddIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import axios from 'axios';

// Status Chip Component
const StatusChip = ({ status }) => {
  const statusConfig = {
    published: {
      label: 'Published',
      color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle className="w-4 h-4" />
    },
    draft: {
      label: 'Draft',
      color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200',
      icon: <Pending className="w-4 h-4" />
    },
    scheduled: {
      label: 'Scheduled',
      color: 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200',
      icon: <ScheduleIcon className="w-4 h-4" />
    },
    archived: {
      label: 'Archived',
      color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
      icon: <Archive className="w-4 h-4" />
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${config.color} text-sm font-medium shadow-sm`}>
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </div>
  );
};

// Blog Type Chip Component
const BlogTypeChip = ({ type }) => {
  const typeConfig = {
    blog: {
      label: 'Blog',
      color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800',
      icon: <ArticleIcon className="w-4 h-4" />
    },
    white_paper: {
      label: 'White Paper',
      color: 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800',
      icon: <ArticleIcon className="w-4 h-4" />
    },
    case_study: {
      label: 'Case Study',
      color: 'bg-gradient-to-br from-cyan-100 to-teal-100 text-cyan-800',
      icon: <ArticleIcon className="w-4 h-4" />
    }
  };

  const config = typeConfig[type] || typeConfig.blog;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${config.color} text-sm font-medium shadow-sm`}>
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </div>
  );
};

// Loading Skeleton Component
const BlogCardSkeleton = () => (
  <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg border border-emerald-100 overflow-hidden animate-pulse">
    <div className="p-6 border-b border-emerald-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded mt-1 w-2/3"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
    
    <div className="p-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
        <div>
          <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
          <div className="w-12 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, blogTitle, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
              <Warning className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Delete Blog Post
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "<span className="font-semibold text-gray-900">{blogTitle}</span>"? 
            This action cannot be undone.
          </p>
          
          {/* Stats */}
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 text-center">
              ⚠️ All associated data including views, images, and analytics will be permanently removed.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-200 flex items-center justify-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-pink-600 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <DeleteIcon className="w-5 h-5 mr-2" />
                  Delete Permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Card Component
const BlogCard = ({ blog, onDelete, onEdit, onFeatureToggle }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isFeatured, setIsFeatured] = useState(blog.is_featured);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(blog.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete blog:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFeatured = async () => {
    setIsTogglingFeatured(true);
    try {
      await onFeatureToggle(blog.id, !isFeatured);
      setIsFeatured(!isFeatured);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    } finally {
      setIsTogglingFeatured(false);
    }
  };

  return (
    <>
      <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Blog Header */}
        <div className="p-6 border-b border-emerald-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {blog.excerpt || 'No excerpt available'}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isTogglingFeatured}
              >
                {isTogglingFeatured ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                ) : (
                  <MoreVert className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {/* Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit(blog.id);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                  >
                    <EditIcon className="w-4 h-4 mr-3" />
                    Edit Post
                  </button>
                  <button
                    onClick={handleToggleFeatured}
                    disabled={isTogglingFeatured}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ThumbUp className="w-4 h-4 mr-3" />
                    {isTogglingFeatured ? 'Loading...' : isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowActions(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                    >
                      <DeleteIcon className="w-4 h-4 mr-3" />
                      Delete Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <StatusChip status={blog.status} />
            <BlogTypeChip type={blog.blog_type} />
            {blog.is_featured && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                Featured
              </span>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
              <ViewIcon className="w-4 h-4 text-emerald-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Views</p>
                <p className="text-sm font-semibold text-emerald-700">{blog.view_count?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <AccessTime className="w-4 h-4 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Read Time</p>
                <p className="text-sm font-semibold text-blue-700">{blog.reading_time_minutes || 5} min</p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <ThumbUp className="w-4 h-4 text-purple-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">SEO Score</p>
                <p className="text-sm font-semibold text-purple-700">
                  {blog.seo_indicators?.seo_score || 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
              <CalendarToday className="w-4 h-4 text-amber-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Published</p>
                <p className="text-sm font-semibold text-amber-700">
                  {formatDate(blog.published_at || blog.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Footer */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-white">
                {blog.author_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {blog.author_name || 'Unknown Author'}
              </p>
              <p className="text-xs text-gray-500">Author</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center"
              disabled={isDeleting}
            >
              <DeleteIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        blogTitle={blog.title}
        isLoading={isDeleting}
      />
    </>
  );
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/blogs/api/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      // Server responded with error
      return Promise.reject({
        message: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Network error. Please check your connection and make sure ngrok is running.',
        status: null,
        data: null
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message,
        status: null,
        data: null
      });
    }
  }
);

// API Functions
const blogAPI = {
  // Fetch blogs with pagination and filters
  getBlogs: async (params = {}) => {
    try {
      console.log('📡 Fetching blogs with params:', params);
      const response = await api.get('blogs/', { params });
      console.log('✅ Blogs response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
      throw error;
    }
  },

  // Fetch blog statistics
  getBlogStats: async () => {
    try {
      console.log('📡 Fetching blog stats...');
      const response = await api.get('blogs/stats/');
      console.log('✅ Stats response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  },

  // Search blogs
  searchBlogs: async (query, params = {}) => {
    try {
      console.log('🔍 Searching blogs:', query);
      const response = await api.get('blogs/search/', { 
        params: { q: query, ...params } 
      });
      console.log('✅ Search response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error searching blogs:', error);
      throw error;
    }
  },

  // Delete a blog
  deleteBlog: async (blogId) => {
    try {
      console.log('🗑️ Deleting blog:', blogId);
      const response = await api.delete(`blogs/${blogId}/delete/`);
      console.log('✅ Delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error deleting blog:', error);
      throw error;
    }
  },

  // Toggle featured status
  featureBlog: async (blogId) => {
    try {
      console.log('⭐ Toggling featured for blog:', blogId);
      const response = await api.post(`blogs/${blogId}/feature/`);
      console.log('✅ Feature response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error featuring blog:', error);
      throw error;
    }
  },

  // Get blog by ID
  getBlogById: async (blogId) => {
    try {
      console.log('📄 Fetching blog by ID:', blogId);
      const response = await api.get(`blogs/${blogId}/`);
      console.log('✅ Blog by ID response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching blog:', error);
      throw error;
    }
  },

  // Get my blogs
  getMyBlogs: async (params = {}) => {
    try {
      console.log('👤 Fetching my blogs with params:', params);
      const response = await api.get('blogs/my/', { params });
      console.log('✅ My blogs response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching my blogs:', error);
      throw error;
    }
  },

  // Test connection
  testConnection: async () => {
    try {
      console.log('🔌 Testing connection to:', API_BASE_URL);
      const response = await api.get('blogs/');
      console.log('✅ Connection test successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error };
    }
  }
};

// Constants
const blogConstants = {
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

// Connection Status Component
const ConnectionStatus = ({ isConnected, onRetry }) => (
  <div className={`mb-6 rounded-xl p-4 border ${
    isConnected 
      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' 
      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
  }`}>
    <div className="flex items-center">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
        isConnected 
          ? 'bg-emerald-100' 
          : 'bg-red-100'
      }`}>
        {isConnected ? (
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        ) : (
          <CloudOffIcon className="w-6 h-6 text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className={`text-sm font-semibold ${
          isConnected ? 'text-emerald-800' : 'text-red-800'
        }`}>
          {isConnected ? 'Connected to Blog API' : 'API Connection Error'}
        </h3>
        <p className={`text-sm mt-1 ${
          isConnected ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {isConnected 
            ? `Connected to ${API_BASE_URL}` 
            : 'Unable to connect to the blog API. Make sure your Django server is running.'
          }
        </p>
      </div>
      {!isConnected && (
        <button
          onClick={onRetry}
          className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition-all duration-200"
        >
          Retry Connection
        </button>
      )}
    </div>
  </div>
);

// Empty State Component
const EmptyBlogsState = ({ onCreateBlog }) => (
  <div className="text-center py-16 border-2 border-dashed border-emerald-300/50 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50">
    <div className="inline-flex p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
      <ArticleIcon className="h-16 w-16 text-emerald-600" />
    </div>
    <h3 className="mt-4 text-2xl font-bold text-gray-900">No blog posts yet</h3>
    <p className="mt-2 text-gray-500 mb-6 max-w-md mx-auto">
      Your blog dashboard is empty. Create your first blog post to get started and build your content library.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onCreateBlog}
        className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-xl"
      >
        <AddIcon className="w-5 h-5 mr-2" />
        Create Your First Blog
      </button>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-6 py-3 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
      >
        <Refresh className="w-5 h-5 mr-2" />
        Refresh Page
      </button>
    </div>
    <div className="mt-8 text-sm text-gray-500">
      <p className="mb-2">Need help getting started?</p>
      <div className="space-y-2">
        <p className="flex items-center justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
          Click "Create Your First Blog" to start writing
        </p>
        <p className="flex items-center justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
          Add SEO metadata to improve visibility
        </p>
        <p className="flex items-center justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
          Schedule posts for future publishing
        </p>
      </div>
    </div>
  </div>
);

// Main Component
const ViewBlogsPage = () => {
  const navigate = useNavigate(); // Add this line
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [lastDeletedBlog, setLastDeletedBlog] = useState(null);
  const [showStats, setShowStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredUpdating, setFeaturedUpdating] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const [connectionTested, setConnectionTested] = useState(false);

  const pageSize = 10;

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      const result = await blogAPI.testConnection();
      setIsConnected(result.success);
      setConnectionTested(true);
      
      if (result.success) {
        // If connection is good, fetch blogs
        fetchBlogs();
        fetchStats();
      } else {
        setError(result.error?.message || 'Failed to connect to server');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setIsConnected(false);
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs from API
  const fetchBlogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        page_size: pageSize,
        ...filters
      };

      console.log('📡 Fetching blogs with params:', params);
      const response = await blogAPI.getBlogs(params);
      
      console.log('✅ Blogs data received:', response);
      
      setBlogs(response.blogs || []);
      setTotalCount(response.total_count || 0);
      setTotalPages(response.total_pages || 1);
      
    } catch (err) {
      console.error('❌ Failed to fetch blogs:', err);
      setError(err.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  // Fetch blog statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📡 Fetching blog stats...');
      const response = await blogAPI.getBlogStats();
      console.log('✅ Stats data received:', response);
      setShowStats(response.stats);
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
      // Don't set error for stats - it's optional
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isConnected && connectionTested) {
      fetchBlogs();
      fetchStats();
    }
  }, [fetchBlogs, fetchStats, isConnected, connectionTested]);

  // Apply filters and search
  useEffect(() => {
    const filters = {};
    
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    
    if (typeFilter !== 'all') {
      filters.type = typeFilter;
    }
    
    if (searchQuery) {
      // Use search endpoint for search queries
      handleSearch(searchQuery, filters);
    } else {
      fetchBlogs(filters);
    }
  }, [statusFilter, typeFilter, searchQuery, page]);

  // Search function
  const handleSearch = async (query, additionalFilters = {}) => {
    try {
      setLoading(true);
      const response = await blogAPI.searchBlogs(query, additionalFilters);
      
      setBlogs(response.blogs || []);
      setTotalCount(response.total_count || 0);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle blog deletion
  const handleDelete = async (blogId) => {
    try {
      const blogToDelete = blogs.find(blog => blog.id === blogId);
      setLastDeletedBlog(blogToDelete);
      
      // Remove from UI immediately
      setBlogs(prev => prev.filter(blog => blog.id !== blogId));
      setTotalCount(prev => prev - 1);
      
      // Show undo notification
      setShowUndoNotification(true);
      
      // Call API to delete
      await blogAPI.deleteBlog(blogId);
      
      console.log('✅ Blog deleted successfully');
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        if (showUndoNotification) {
          setShowUndoNotification(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ Failed to delete blog:', error);
      // Re-add blog if deletion failed
      if (lastDeletedBlog) {
        setBlogs(prev => [...prev, lastDeletedBlog]);
        setTotalCount(prev => prev + 1);
      }
      setError(error.message || 'Failed to delete blog');
      setShowUndoNotification(false);
    }
  };

  // Handle toggle featured status
  const handleToggleFeatured = async (blogId, newFeaturedStatus) => {
    try {
      setFeaturedUpdating(prev => ({ ...prev, [blogId]: true }));
      
      await blogAPI.featureBlog(blogId);
      
      // Update local state
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { ...blog, is_featured: newFeaturedStatus }
          : blog
      ));
      
      console.log('✅ Blog featured status updated');
      
    } catch (error) {
      console.error('❌ Failed to toggle featured status:', error);
      setError(error.message || 'Failed to update featured status');
    } finally {
      setFeaturedUpdating(prev => ({ ...prev, [blogId]: false }));
    }
  };

  // Handle undo delete
  const handleUndoDelete = () => {
    if (lastDeletedBlog) {
      // Re-add blog to list
      setBlogs(prev => [...prev, lastDeletedBlog]);
      setTotalCount(prev => prev + 1);
      setShowUndoNotification(false);
      setLastDeletedBlog(null);
    }
  };

  // Handle edit - UPDATED TO USE REACT ROUTER NAVIGATE
  const handleEdit = (blogId) => {
    console.log('Navigating to edit blog with ID:', blogId);
    navigate(`/dashboard/crud-page/update-blog/${blogId}`);
  };

  // Handle create - UPDATED TO USE REACT ROUTER NAVIGATE
  const handleCreate = () => {
    navigate('/dashboard/crud-page/create-blog');
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    testConnection();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  // Calculate counts
  const getStatusCount = (status) => {
    return blogs.filter(blog => blog.status === status).length;
  };

  const getTypeCount = (type) => {
    return blogs.filter(blog => blog.blog_type === type).length;
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Show empty state when there are no blogs
  if (blogs.length === 0 && !loading && isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
              Blog Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to your blog content management system
            </p>
          </div>

          {/* Connection Status */}
          <ConnectionStatus isConnected={isConnected} onRetry={testConnection} />

          {/* Empty State */}
          <EmptyBlogsState onCreateBlog={handleCreate} />

          {/* Quick Stats */}
          <div className="mt-8 bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                    <AddIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-medium text-emerald-800">Create Content</h4>
                </div>
                <p className="text-sm text-emerald-600">
                  Start by creating your first blog post. Add engaging content with images.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <ArticleIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">Optimize SEO</h4>
                </div>
                <p className="text-sm text-blue-600">
                  Add SEO metadata, keywords, and descriptions to improve visibility.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <CalendarToday className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-purple-800">Schedule Posts</h4>
                </div>
                <p className="text-sm text-purple-600">
                  Plan your content calendar by scheduling posts for future publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !connectionTested) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Connection Status Skeleton */}
          <div className="mb-6 h-20 bg-gray-200 rounded-xl"></div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          
          {/* Blog Cards Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Undo Notification */}
      {showUndoNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-white rounded-lg shadow-xl border border-emerald-200 p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                  <DeleteIcon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Blog deleted successfully
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  "{lastDeletedBlog?.title}" has been deleted
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={handleUndoDelete}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Undo
                </button>
                <button
                  onClick={() => setShowUndoNotification(false)}
                  className="ml-4 text-sm font-medium text-gray-400 hover:text-gray-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Connection Status */}
        <ConnectionStatus isConnected={isConnected} onRetry={testConnection} />

        {/* Error Display */}
        {error && !isConnected && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <ErrorIcon className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">API Connection Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={testConnection}
                className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
                View All Blogs
              </h1>
              <p className="text-gray-600 mt-2">
                Manage, view, and delete your blog posts ({totalCount} total)
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center px-4 py-2.5 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50"
              >
                <Refresh className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={handleCreate}
                className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                <AddIcon className="w-5 h-5 mr-2" />
                Create New Blog
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {blogs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow border border-emerald-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
                <p className="text-2xl font-bold text-emerald-700">{totalCount}</p>
              </div>
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow border border-blue-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                <p className="text-2xl font-bold text-blue-700">
                  {showStats?.published_blogs || getStatusCount('published')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-4 shadow border border-amber-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-amber-700">
                  {showStats?.draft_blogs || getStatusCount('draft')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 shadow border border-red-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-red-700">
                  {showStats?.scheduled_blogs || getStatusCount('scheduled')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters - Only show if there are blogs */}
        {blogs.length > 0 && (
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">Filter Blogs</h3>
              <div className="flex items-center space-x-3">
                {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <ClearIcon className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                )}
                <span className="text-sm text-gray-500">
                  Showing {blogs.length} of {totalCount} blogs (Page {page} of {totalPages})
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Blogs
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by title, content, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    >
                      <ClearIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
                  >
                    <option value="all">All Statuses</option>
                    {blogConstants.STATUS_CHOICES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArticleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
                  >
                    <option value="all">All Types</option>
                    {blogConstants.TYPE_CHOICES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && blogs.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="space-y-6">
          {!loading && blogs.length > 0 ? (
            <>
              {blogs.map((blog) => (
                <BlogCard 
                  key={blog.id} 
                  blog={blog} 
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onFeatureToggle={handleToggleFeatured}
                />
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1 || loading}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                      page === 1 || loading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages || loading}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                      page === totalPages || loading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : !loading && blogs.length === 0 && isConnected ? (
            <EmptyBlogsState onCreateBlog={handleCreate} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewBlogsPage;
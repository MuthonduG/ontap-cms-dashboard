import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Article as ArticleIcon,
  CheckCircle,
  Pending,
  Drafts,
  Archive,
  Search,
  Clear,
  Description,
  FormatSize,
  Title,
  Visibility,
  AccessTime,
  TextFields,
  Image as ImageIcon,
  Link as LinkIcon,
  ThumbUp,
  TrendingUp,
  Share,
  CalendarToday,
  Person,
  Language,
  VisibilityOff,
  MoreVert,
  ContentCopy,
  OpenInNew
} from '@mui/icons-material';

// Mock data - Ensure all blogs have seo_indicators
const mockBlogs = [
  {
    id: 1,
    title: 'Getting Started with React Hooks',
    slug: 'getting-started-with-react-hooks',
    excerpt: 'Learn how to use React Hooks in your applications',
    body: `<h1>React Hooks Tutorial</h1>
<p>React Hooks revolutionized how we write React components...</p>
<h2>What are React Hooks?</h2>
<p>React Hooks are functions that let you "hook into" React state and lifecycle features from function components.</p>
<h2>Benefits of Using Hooks</h2>
<p>Hooks allow you to reuse stateful logic without changing your component hierarchy...</p>`,
    blog_type: 'blog',
    user: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
    user_id: 1,
    status: 'published',
    seo_title: 'React Hooks Tutorial for Beginners - Complete Guide 2024',
    meta_description: 'Learn how to use React Hooks in your applications with this comprehensive tutorial. Perfect for beginners looking to master modern React development.',
    canonical_url: 'https://example.com/blog/react-hooks-tutorial',
    primary_keyword: 'react hooks',
    secondary_keywords: ['react', 'javascript', 'tutorial', 'frontend development', 'web development'],
    search_intent: 'informational',
    featured_image: null,
    featured_image_alt: '',
    image_url: null,
    image_width: 0,
    image_height: 0,
    image_file_size: 0,
    internal_links: [
      { id: 2, slug: 'modern-web-development', title: 'Modern Web Development', anchor: 'learn more' },
      { id: 3, slug: 'react-performance', title: 'React Performance Optimization', anchor: 'performance tips' }
    ],
    word_count: 850,
    reading_time_minutes: 5,
    h1_count: 1,
    h2_count: 3,
    h3_count: 4,
    published_at: '2024-01-15T09:30:00Z',
    scheduled_publish_at: null,
    is_featured: true,
    view_count: 1250,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-14T15:30:00Z',
    author_name: 'John Doe',
    author_avatar: null,
    url: '/blog/getting-started-with-react-hooks',
    is_published: true,
    seo_indicators: {
      meta_title_length: 52,
      meta_title_optimal: true,
      meta_description_length: 148,
      meta_description_optimal: true,
      has_featured_image: false,
      has_image_alt: false,
      word_count: 850,
      reading_time: 5,
      h1_count: 1,
      h2_count: 3,
      h3_count: 4,
      seo_score: 78
    },
    images: [],
    views: []
  },
  {
    id: 2,
    title: 'Modern Web Development Best Practices',
    slug: 'modern-web-development-best-practices',
    excerpt: 'Industry standards for modern web development',
    body: `<h1>Web Development Best Practices 2024</h1>
<p>Modern web development has evolved significantly...</p>
<h2>Performance Optimization</h2>
<p>Learn how to optimize your web applications for better performance...</p>
<h2>Security Considerations</h2>
<p>Security should never be an afterthought in web development...</p>`,
    blog_type: 'white_paper',
    user: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: null
    },
    user_id: 2,
    status: 'scheduled',
    seo_title: 'Web Development Best Practices 2024',
    meta_description: 'Industry standards for modern web development including performance, security, and accessibility best practices.',
    canonical_url: '',
    primary_keyword: 'web development',
    secondary_keywords: ['best practices', 'standards', 'frontend', 'performance', 'security'],
    search_intent: 'informational',
    featured_image: null,
    featured_image_alt: '',
    image_url: null,
    image_width: 0,
    image_height: 0,
    image_file_size: 0,
    internal_links: [],
    word_count: 1200,
    reading_time_minutes: 8,
    h1_count: 1,
    h2_count: 2,
    h3_count: 4,
    published_at: null,
    scheduled_publish_at: '2024-12-25T08:00:00Z',
    is_featured: false,
    view_count: 890,
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    author_name: 'Jane Smith',
    author_avatar: null,
    url: '/blog/modern-web-development-best-practices',
    is_published: false,
    seo_indicators: {
      meta_title_length: 40,
      meta_title_optimal: false,
      meta_description_length: 105,
      meta_description_optimal: false,
      has_featured_image: false,
      has_image_alt: false,
      word_count: 1200,
      reading_time: 8,
      h1_count: 1,
      h2_count: 2,
      h3_count: 4,
      seo_score: 56
    },
    images: [],
    views: []
  },
  {
    id: 3,
    title: 'Case Study: E-commerce Performance Optimization',
    slug: 'ecommerce-performance-optimization-case-study',
    excerpt: 'How we improved an e-commerce site performance by 300%',
    body: `<h1>E-commerce Performance Optimization Case Study</h1>
<p>In this case study, we explore how we transformed an e-commerce site's performance...</p>`,
    blog_type: 'case_study',
    user: {
      id: 3,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: null
    },
    user_id: 3,
    status: 'draft',
    seo_title: 'E-commerce Performance Optimization Case Study - 300% Improvement',
    meta_description: 'Real-world case study showing how we improved e-commerce site performance by 300% through strategic optimization techniques.',
    canonical_url: '',
    primary_keyword: 'e-commerce optimization',
    secondary_keywords: ['performance', 'case study', 'web vitals', 'conversion rate'],
    search_intent: 'commercial',
    featured_image: null,
    featured_image_alt: '',
    image_url: null,
    image_width: 0,
    image_height: 0,
    image_file_size: 0,
    internal_links: [
      { id: 1, slug: 'getting-started-with-react-hooks', title: 'React Hooks Tutorial', anchor: 'React guide' }
    ],
    word_count: 1500,
    reading_time_minutes: 10,
    h1_count: 1,
    h2_count: 4,
    h3_count: 6,
    published_at: null,
    scheduled_publish_at: null,
    is_featured: true,
    view_count: 0,
    created_at: '2024-01-18T11:15:00Z',
    updated_at: '2024-01-18T11:15:00Z',
    author_name: 'Alex Johnson',
    author_avatar: null,
    url: '/blog/ecommerce-performance-optimization-case-study',
    is_published: false,
    seo_indicators: {
      meta_title_length: 68,
      meta_title_optimal: false,
      meta_description_length: 155,
      meta_description_optimal: true,
      has_featured_image: false,
      has_image_alt: false,
      word_count: 1500,
      reading_time: 10,
      h1_count: 1,
      h2_count: 4,
      h3_count: 6,
      seo_score: 85
    },
    images: [],
    views: []
  }
];

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
      icon: <Drafts className="w-4 h-4" />
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
      color: 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800',
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

// SEO Score Component
const SeoScore = ({ score = 0 }) => {
  const getColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBgColor = (score) => {
    if (score >= 80) return 'text-emerald-100';
    if (score >= 60) return 'text-amber-100';
    return 'text-red-100';
  };

  const validScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className={`${getBgColor(validScore)} opacity-30`}
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset.toString()}
            strokeLinecap="round"
            className={`${getColor(validScore)} transition-all duration-500 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-base font-bold ${getColor(validScore)}`}>
            {Math.round(validScore)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Blogs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blog Type</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArticleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filters.blog_type || ''}
              onChange={(e) => onFilterChange('blog_type', e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Types</option>
              <option value="blog">Blog Post</option>
              <option value="white_paper">White Paper</option>
              <option value="case_study">Case Study</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Status</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <StarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filters.is_featured || ''}
              onChange={(e) => onFilterChange('is_featured', e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Posts</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Blogs</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, content, or keyword..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white/70 backdrop-blur-sm"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
              >
                <Clear className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">Search in titles, excerpts, content, and keywords</p>
        </div>
      </div>
    </div>
  );
};

// Content Preview Component
const ContentPreview = ({ content }) => {
  const [preview, setPreview] = useState('');
  
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, '');
    setPreview(plainText.substring(0, 150) + (plainText.length > 150 ? '...' : ''));
  }, [content]);

  return (
    <div className="group">
      <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">{preview}</p>
    </div>
  );
};

// SEO Indicators Component
const SeoIndicators = ({ indicators = {} }) => {
  const safeIndicators = {
    meta_title_length: indicators?.meta_title_length || 0,
    meta_title_optimal: indicators?.meta_title_optimal || false,
    meta_description_length: indicators?.meta_description_length || 0,
    meta_description_optimal: indicators?.meta_description_optimal || false,
    has_featured_image: indicators?.has_featured_image || false,
    has_image_alt: indicators?.has_image_alt || false,
    reading_time: indicators?.reading_time || 0
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-600 mb-3">SEO Analysis</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <TextFields className="w-4 h-4 text-gray-500" />
          <span className="text-xs">Title: {safeIndicators.meta_title_length}/60</span>
          {safeIndicators.meta_title_optimal ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Pending className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <TextFields className="w-4 h-4 text-gray-500" />
          <span className="text-xs">Desc: {safeIndicators.meta_description_length}/160</span>
          {safeIndicators.meta_description_optimal ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Pending className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <ImageIcon className="w-4 h-4 text-gray-500" />
          <span className="text-xs">Featured Image</span>
          {safeIndicators.has_featured_image ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Pending className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <AccessTime className="w-4 h-4 text-gray-500" />
          <span className="text-xs">{safeIndicators.reading_time} min read</span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CmsCrudPage = () => {
  const [blogs, setBlogs] = useState(mockBlogs);
  const [filteredBlogs, setFilteredBlogs] = useState(mockBlogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    blog_type: '',
    is_featured: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    blog_type: 'blog',
    status: 'draft',
    seo_title: '',
    meta_description: '',
    canonical_url: '',
    primary_keyword: '',
    secondary_keywords: [],
    search_intent: 'informational',
    featured_image: null,
    featured_image_alt: '',
    internal_links: [],
    scheduled_publish_at: '',
    is_featured: false,
    user_id: 1
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setBlogs(mockBlogs);
        setFilteredBlogs(mockBlogs);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch blogs');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...blogs];
    
    if (filters.status) {
      result = result.filter(blog => blog.status === filters.status);
    }
    
    if (filters.blog_type) {
      result = result.filter(blog => blog.blog_type === filters.blog_type);
    }
    
    if (filters.is_featured !== '') {
      const isFeatured = filters.is_featured === 'true';
      result = result.filter(blog => blog.is_featured === isFeatured);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.excerpt.toLowerCase().includes(searchTerm) ||
        blog.body.toLowerCase().includes(searchTerm) ||
        blog.primary_keyword.toLowerCase().includes(searchTerm) ||
        blog.author_name.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredBlogs(result);
    setPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handlePageChange = (value) => {
    setPage(value);
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBlogs.length / rowsPerPage);

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setTabValue(0);
    setOpenViewModal(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      body: blog.body,
      blog_type: blog.blog_type,
      status: blog.status,
      seo_title: blog.seo_title,
      meta_description: blog.meta_description,
      canonical_url: blog.canonical_url,
      primary_keyword: blog.primary_keyword,
      secondary_keywords: blog.secondary_keywords,
      search_intent: blog.search_intent,
      featured_image: blog.featured_image,
      featured_image_alt: blog.featured_image_alt,
      internal_links: blog.internal_links,
      scheduled_publish_at: blog.scheduled_publish_at || '',
      is_featured: blog.is_featured,
      user_id: blog.user_id
    });
    setTabValue(0);
    setOpenEditModal(true);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      excerpt: '',
      body: '',
      blog_type: 'blog',
      status: 'draft',
      seo_title: '',
      meta_description: '',
      canonical_url: '',
      primary_keyword: '',
      secondary_keywords: [],
      search_intent: 'informational',
      featured_image: null,
      featured_image_alt: '',
      internal_links: [],
      scheduled_publish_at: '',
      is_featured: false,
      user_id: 1
    });
    setTabValue(0);
    setOpenCreateModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (openEditModal && selectedBlog) {
        console.log('Updating blog:', formData);
        setBlogs(blogs.map(blog => 
          blog.id === selectedBlog.id 
            ? { ...blog, ...formData, updated_at: new Date().toISOString() }
            : blog
        ));
      } else if (openCreateModal) {
        console.log('Creating blog:', formData);
        const newBlog = {
          id: blogs.length + 1,
          ...formData,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image_url: null,
          image_width: 0,
          image_height: 0,
          image_file_size: 0,
          word_count: formData.body ? formData.body.split(/\s+/).length : 0,
          reading_time_minutes: Math.max(1, Math.floor((formData.body ? formData.body.split(/\s+/).length : 0) / 200)),
          h1_count: (formData.body.match(/<h1[^>]*>/gi) || []).length,
          h2_count: (formData.body.match(/<h2[^>]*>/gi) || []).length,
          h3_count: (formData.body.match(/<h3[^>]*>/gi) || []).length,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
          author_name: 'Current User',
          author_avatar: null,
          url: `/blog/${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          is_published: formData.status === 'published',
          seo_indicators: {
            meta_title_length: formData.seo_title.length || 0,
            meta_title_optimal: formData.seo_title.length >= 50 && formData.seo_title.length <= 60,
            meta_description_length: formData.meta_description.length || 0,
            meta_description_optimal: formData.meta_description.length >= 120 && formData.meta_description.length <= 160,
            has_featured_image: !!formData.featured_image,
            has_image_alt: !!formData.featured_image_alt,
            word_count: formData.body ? formData.body.split(/\s+/).length : 0,
            reading_time: Math.max(1, Math.floor((formData.body ? formData.body.split(/\s+/).length : 0) / 200)),
            h1_count: (formData.body.match(/<h1[^>]*>/gi) || []).length,
            h2_count: (formData.body.match(/<h2[^>]*>/gi) || []).length,
            h3_count: (formData.body.match(/<h3[^>]*>/gi) || []).length,
            seo_score: Math.floor(Math.random() * 100)
          },
          images: [],
          views: []
        };
        setBlogs([newBlog, ...blogs]);
      }
      
      setOpenEditModal(false);
      setOpenCreateModal(false);
      setSelectedBlog(null);
      setLoading(false);
    } catch (err) {
      setError('Operation failed');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const handleCopyLink = () => {
    if (selectedBlog) {
      navigator.clipboard.writeText(window.location.origin + selectedBlog.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Enhanced View Modal with better aesthetics
  const ViewModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${openViewModal ? 'block' : 'hidden'}`}>
      {/* Enhanced Backdrop with blur and better visibility */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-gray-900/85 to-gray-950/90 backdrop-blur-sm transition-all duration-300 ease-out"
        onClick={() => setOpenViewModal(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-teal-600/10"></div>
      </div>
      
      {/* Enhanced Modal Container with glass morphism */}
      <div className="relative z-10 bg-gradient-to-br from-white to-emerald-50/95 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/40 backdrop-blur-xl">
        {/* Modal Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-teal-400 px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-2xl font-bold text-white mb-3">{selectedBlog?.title}</h3>
              <div className="flex flex-wrap gap-3">
                <StatusChip status={selectedBlog?.status} />
                <BlogTypeChip type={selectedBlog?.blog_type} />
                {selectedBlog?.is_featured && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-sm font-semibold shadow-lg">
                    <StarIcon className="w-5 h-5 mr-2" />
                    Featured
                  </div>
                )}
                {/* SEO Score Badge */}
                {selectedBlog?.seo_indicators && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 text-sm font-semibold shadow-lg">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    SEO: {Math.round(selectedBlog.seo_indicators.seo_score)}%
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setOpenViewModal(false)}
              className="ml-4 flex-shrink-0 rounded-full p-2.5 bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 shadow-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Enhanced Tabs with modern design */}
        <div className="border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-white">
          <nav className="flex space-x-1 px-6">
            {['Overview', 'Content', 'SEO Details', 'Analytics'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => handleTabChange(index)}
                className={`
                  relative px-6 py-4 text-sm font-medium transition-all duration-300
                  ${tabValue === index 
                    ? 'text-emerald-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }
                `}
              >
                <span className="flex items-center space-x-2">
                  {index === 0 && <ArticleIcon className="w-5 h-5" />}
                  {index === 1 && <Description className="w-5 h-5" />}
                  {index === 2 && <TrendingUp className="w-5 h-5" />}
                  {index === 3 && <ThumbUp className="w-5 h-5" />}
                  <span>{tab}</span>
                </span>
                {tabValue === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="px-8 py-6 overflow-y-auto max-h-[55vh] custom-scrollbar">
          {tabValue === 0 && selectedBlog && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - SEO & Stats */}
              <div className="space-y-6">
                {/* SEO Score Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">SEO Analysis</h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBlog.seo_indicators?.seo_score >= 80 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : selectedBlog.seo_indicators?.seo_score >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedBlog.seo_indicators?.seo_score >= 80 ? 'Excellent' : 
                       selectedBlog.seo_indicators?.seo_score >= 60 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-8">
                    <SeoScore score={selectedBlog.seo_indicators?.seo_score} />
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBlog.seo_indicators?.meta_title_optimal ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <CheckCircle className={`w-5 h-5 ${selectedBlog.seo_indicators?.meta_title_optimal ? 'text-emerald-500' : 'text-gray-300'}`} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Title Length</span>
                          <p className="text-xs text-gray-500">{selectedBlog.seo_indicators?.meta_title_length}/60 chars</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBlog.seo_indicators?.meta_description_optimal ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <CheckCircle className={`w-5 h-5 ${selectedBlog.seo_indicators?.meta_description_optimal ? 'text-emerald-500' : 'text-gray-300'}`} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Meta Description</span>
                          <p className="text-xs text-gray-500">{selectedBlog.seo_indicators?.meta_description_length}/160 chars</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBlog.seo_indicators?.has_featured_image ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <CheckCircle className={`w-5 h-5 ${selectedBlog.seo_indicators?.has_featured_image ? 'text-emerald-500' : 'text-gray-300'}`} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Featured Image</span>
                          <p className="text-xs text-gray-500">{selectedBlog.seo_indicators?.has_featured_image ? 'Present' : 'Missing'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <Visibility className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-600">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedBlog.view_count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total views</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <AccessTime className="w-5 h-5 text-teal-500" />
                      <span className="text-sm font-medium text-gray-600">Read Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedBlog.reading_time_minutes} min</p>
                    <p className="text-xs text-gray-500 mt-1">Average reading</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <TextFields className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-600">Words</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedBlog.word_count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Content length</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <LinkIcon className="w-5 h-5 text-teal-500" />
                      <span className="text-sm font-medium text-gray-600">Links</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedBlog.internal_links?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Internal links</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* SEO Details Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">SEO Title</label>
                      <p className="text-gray-800 font-medium bg-white/50 p-3 rounded-lg border border-gray-200">{selectedBlog.seo_title || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Primary Keyword</label>
                      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-200">
                        <Language className="w-4 h-4 text-emerald-600 mr-2" />
                        <span className="font-medium text-emerald-800">{selectedBlog.primary_keyword}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                      <p className="text-gray-700 text-sm leading-relaxed bg-white/50 p-3 rounded-lg border border-gray-200">{selectedBlog.meta_description || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CalendarToday className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Published</p>
                        <p className="text-gray-800 font-medium">
                          {selectedBlog.published_at ? formatDate(selectedBlog.published_at) : 'Not published'}
                        </p>
                      </div>
                    </div>
                    {selectedBlog.scheduled_publish_at && (
                      <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-teal-100 hover:bg-teal-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <ScheduleIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Scheduled For</p>
                          <p className="text-gray-800 font-medium">{formatDate(selectedBlog.scheduled_publish_at)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <EditIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Updated</p>
                        <p className="text-gray-800 font-medium">{formatDate(selectedBlog.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tabValue === 1 && selectedBlog && (
            <div className="space-y-6">
              {/* Excerpt Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Excerpt</h4>
                <div className="bg-white/70 border border-emerald-200 rounded-lg p-5 hover:border-emerald-300 transition-colors">
                  <p className="text-gray-700 leading-relaxed">{selectedBlog.excerpt}</p>
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Content Preview</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/70 px-3 py-1.5 rounded-lg border border-gray-200">
                    <TextFields className="w-4 h-4" />
                    <span>{selectedBlog.word_count.toLocaleString()} words</span>
                  </div>
                </div>
                <div className="bg-white/70 border border-gray-200 rounded-lg p-5 max-h-80 overflow-y-auto custom-scrollbar hover:border-gray-300 transition-colors">
                  <div 
                    className="prose prose-emerald max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.body || '' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {tabValue === 2 && selectedBlog && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SEO Analysis Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Analysis</h4>
                <div className="space-y-4">
                  <SeoIndicators indicators={selectedBlog.seo_indicators} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Search Intent</label>
                    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-200">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                      <span className="capitalize font-medium text-emerald-800">{selectedBlog.search_intent}</span>
                    </div>
                  </div>
                  
                  {selectedBlog.canonical_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Canonical URL</label>
                      <div className="flex items-center space-x-2 p-3 bg-white/70 rounded-lg border border-gray-200">
                        <LinkIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-emerald-600 text-sm truncate">{selectedBlog.canonical_url}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords & Links Card */}
              <div className="space-y-6">
                {/* Keywords Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Keywords</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Secondary Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.secondary_keywords?.length > 0 ? (
                        selectedBlog.secondary_keywords.map((keyword, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200 hover:border-emerald-300 transition-colors cursor-default"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic p-3 bg-white/50 rounded-lg border border-gray-200">No secondary keywords</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Internal Links Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Internal Links</h4>
                  {selectedBlog.internal_links?.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedBlog.internal_links.map((link, index) => (
                        <li key={index} className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Anchor: "{link.anchor}"</p>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic p-3 bg-white/50 rounded-lg border border-gray-200">No internal links</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tabValue === 3 && selectedBlog && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Author Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Author</h4>
                <div className="flex items-center space-x-4 p-4 bg-white/70 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {selectedBlog.author_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 text-lg">{selectedBlog.author_name}</h5>
                    <p className="text-gray-600 text-sm">Content Creator</p>
                    <div className="flex items-center space-x-3 mt-3">
                      <button className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                        View Profile
                      </button>
                      <button className="text-xs px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/70 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors">
                    <div className="text-2xl font-bold text-emerald-700 mb-1">
                      {selectedBlog.view_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl border border-teal-200 hover:border-teal-300 transition-colors">
                    <div className="text-2xl font-bold text-teal-700 mb-1">
                      {Math.round(selectedBlog.view_count / 30)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Daily Views</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    This post is performing {selectedBlog.view_count > 1000 ? 'exceptionally' : 'moderately'} well
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Modal Footer */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-5 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow"
              >
                <ContentCopy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => window.open(selectedBlog?.url, '_blank')}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg"
              >
                <OpenInNew className="w-4 h-4 mr-2" />
                View Live
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setOpenViewModal(false);
                  handleEdit(selectedBlog);
                }}
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <EditIcon className="w-5 h-5 mr-2" />
                Edit Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Edit/Create Modal
  const EditCreateModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${openEditModal || openCreateModal ? 'block' : 'hidden'}`}>
      {/* Enhanced Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-gray-900/85 to-gray-950/90 backdrop-blur-sm transition-all duration-300 ease-out"
        onClick={() => {
          setOpenEditModal(false);
          setOpenCreateModal(false);
          setSelectedBlog(null);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-teal-600/10"></div>
      </div>
      
      {/* Enhanced Modal Container */}
      <div className="relative z-10 bg-gradient-to-br from-white to-emerald-50/95 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/40 backdrop-blur-xl">
        <form onSubmit={handleFormSubmit}>
          {/* Modal Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-teal-400 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {openEditModal ? 'Edit Blog Post' : 'Create New Blog'}
                </h3>
                <p className="text-emerald-100 mt-2">
                  {openEditModal ? 'Update your blog post details' : 'Create a new engaging blog post'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenEditModal(false);
                  setOpenCreateModal(false);
                  setSelectedBlog(null);
                }}
                className="ml-4 flex-shrink-0 rounded-full p-2.5 bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Enhanced Tabs */}
          <div className="border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-white">
            <nav className="flex space-x-1 px-6">
              {['Basic Info', 'Content', 'SEO & Settings'].map((tab, index) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => handleTabChange(index)}
                  className={`
                    relative px-6 py-4 text-sm font-medium transition-all duration-300
                    ${tabValue === index 
                      ? 'text-emerald-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }
                  `}
                >
                  <span className="flex items-center space-x-2">
                    {index === 0 && <Title className="w-5 h-5" />}
                    {index === 1 && <Description className="w-5 h-5" />}
                    {index === 2 && <TrendingUp className="w-5 h-5" />}
                    <span>{tab}</span>
                  </span>
                  {tabValue === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="px-8 py-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
            {tabValue === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Title className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                      placeholder="Enter blog post title"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blog Type</label>
                    <select
                      name="blog_type"
                      value={formData.blog_type}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    >
                      <option value="blog">Blog Post</option>
                      <option value="white_paper">White Paper</option>
                      <option value="case_study">Case Study</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Publish Date</label>
                  <input
                    type="datetime-local"
                    name="scheduled_publish_at"
                    value={formData.scheduled_publish_at}
                    onChange={handleInputChange}
                    disabled={formData.status !== 'scheduled'}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {formData.status !== 'scheduled' && (
                    <p className="mt-2 text-xs text-gray-500">Only available for scheduled status</p>
                  )}
                </div>
                
                <div className="flex items-center p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">Featured Post</label>
                  <StarIcon className="ml-2 w-5 h-5 text-yellow-500" />
                </div>
              </div>
            )}
            
            {tabValue === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <Description className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleTextareaChange}
                      rows={3}
                      className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                      placeholder="Short summary (used for meta description fallback)"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Content (HTML/Markdown) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <FormatSize className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleTextareaChange}
                      required
                      rows={12}
                      className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                      placeholder="Main article content. Supports HTML tags for formatting."
                    />
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Word Count: {formData.body.split(/\s+/).length}</span>
                    <span>•</span>
                    <span>Estimated Reading Time: {Math.max(1, Math.floor(formData.body.split(/\s+/).length / 200))} minutes</span>
                  </div>
                </div>
              </div>
            )}
            
            {tabValue === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    name="seo_title"
                    value={formData.seo_title}
                    onChange={handleInputChange}
                    placeholder="50-60 characters optimal"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">{formData.seo_title.length}/60 characters</p>
                    {formData.seo_title.length >= 50 && formData.seo_title.length <= 60 ? (
                      <span className="text-xs text-emerald-600 font-medium">✓ Optimal</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Adjust length</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleTextareaChange}
                    rows={2}
                    placeholder="120-160 characters optimal"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">{formData.meta_description.length}/160 characters</p>
                    {formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? (
                      <span className="text-xs text-emerald-600 font-medium">✓ Optimal</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Adjust length</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Keyword *</label>
                    <input
                      type="text"
                      name="primary_keyword"
                      value={formData.primary_keyword}
                      onChange={handleInputChange}
                      required
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">Main SEO keyword</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Intent</label>
                    <select
                      name="search_intent"
                      value={formData.search_intent}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    >
                      <option value="informational">Informational</option>
                      <option value="commercial">Commercial</option>
                      <option value="transactional">Transactional</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.secondary_keywords) ? formData.secondary_keywords.join(', ') : formData.secondary_keywords}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                      setFormData(prev => ({ ...prev, secondary_keywords: keywords }));
                    }}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="mt-2 text-xs text-gray-500">Separate keywords with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                  <input
                    type="url"
                    name="canonical_url"
                    value={formData.canonical_url}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/70 backdrop-blur-sm"
                    placeholder="https://example.com/blog-post"
                  />
                  <p className="mt-2 text-xs text-gray-500">For duplicate content (optional)</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Modal Footer */}
          <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-5 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex space-x-3">
                {tabValue > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange(tabValue - 1)}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEditModal(false);
                    setOpenCreateModal(false);
                    setSelectedBlog(null);
                  }}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                >
                  Cancel
                </button>
                {tabValue < 2 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange(tabValue + 1)}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg"
                  >
                    Next →
                  </button>
                )}
                {tabValue === 2 && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : openEditModal ? 'Update Post' : 'Create Post'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // Add custom CSS for scrollbars and prose
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(16, 185, 129, 0.5);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(16, 185, 129, 0.7);
      }
      .prose h1 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .prose h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #374151;
      }
      .prose h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #4b5563;
      }
      .prose p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #6b7280;
      }
      .prose a {
        color: #10b981;
        text-decoration: underline;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .modal-enter {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-200/50">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">Blog Management</h1>
          <p className="text-gray-600 mt-2">Manage your blog posts, white papers, and case studies</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <AddIcon className="w-5 h-5 mr-2" />
          Create New
        </button>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
            <p className="text-3xl font-bold text-emerald-700">{filteredBlogs.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
            <p className="text-3xl font-bold text-teal-700">
              {filteredBlogs.filter(b => b.status === 'published').length}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg border border-cyan-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-cyan-700">
              {filteredBlogs.reduce((sum, blog) => sum + blog.view_count, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Featured</p>
            <p className="text-3xl font-bold text-amber-700">
              {filteredBlogs.filter(b => b.is_featured).length}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && blogs.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg overflow-hidden mb-6 border border-emerald-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title & Author</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Content Preview</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SEO Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Publish Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/50">
                  {paginatedBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="group">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{blog.title}</p>
                          <div className="flex items-center mt-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-sm font-medium text-emerald-800">
                                {blog.author_name?.charAt(0)}
                              </span>
                            </div>
                            <p className="ml-3 text-xs text-gray-500">{blog.author_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ContentPreview content={blog.body} />
                      </td>
                      <td className="px-6 py-4">
                        <SeoScore score={blog.seo_indicators?.seo_score} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <BlogTypeChip type={blog.blog_type} />
                          {blog.is_featured && (
                            <div className="ml-2 p-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                              <StarIcon className="w-4 h-4 text-yellow-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={blog.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg w-fit">
                          <Visibility className="w-4 h-4 text-emerald-500 mr-2" />
                          <span className="text-sm font-semibold text-emerald-700">{blog.view_count.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 bg-gray-50/50 p-2 rounded-lg">
                          {blog.published_at 
                            ? formatDate(blog.published_at)
                            : blog.scheduled_publish_at
                              ? <span className="text-emerald-600">Scheduled: {formatDate(blog.scheduled_publish_at)}</span>
                              : 'Not published'
                          }
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(blog)}
                            className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600 hover:from-emerald-200 hover:to-teal-200 transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <ViewIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="p-2 rounded-lg bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-600 hover:from-teal-200 hover:to-emerald-200 transition-all duration-200 hover:shadow-md"
                            title="Edit"
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredBlogs.length > 0 && totalPages > 0 && (
            <div className="flex justify-center mb-6">
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">First</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L13.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? 'z-10 bg-gradient-to-r from-emerald-700 to-teal-400 border-emerald-500 text-white shadow-lg'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Last</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3.293 14.707a1 1 0 010-1.414L6.586 10 3.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}

          {/* Results Info */}
          <p className="text-center text-sm text-gray-600 mb-6 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            Showing {Math.min(startIndex + 1, filteredBlogs.length)} to {Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} entries
          </p>
        </>
      )}

      {/* Empty State */}
      {!loading && filteredBlogs.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-emerald-300/50 rounded-2xl mt-6 bg-gradient-to-br from-white to-emerald-50/50">
          <div className="inline-flex p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
            <ArticleIcon className="h-12 w-12 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">No blogs found</h3>
          <p className="mt-2 text-gray-500 mb-6 max-w-md mx-auto">
            {Object.values(filters).some(f => f !== '') 
              ? 'Try adjusting your filters or search criteria to find what you\'re looking for.' 
              : 'Create your first blog post to get started and share your ideas with the world.'
            }
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <AddIcon className="w-5 h-5 mr-2" />
            Create First Blog
          </button>
        </div>
      )}

      {/* Modals */}
      <ViewModal />
      <EditCreateModal />
    </div>
  );
};

export default CmsCrudPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  Drafts as DraftsIcon,
  Description,
  Title as TitleIcon,
  TextFields,
  Image as ImageIcon,
  Link as LinkIcon,
  TrendingUp,
  AccessTime,
  Clear,
  AddPhotoAlternate,
  Language,
  InsertLink,
  StarBorder,
  Star,
  CheckCircle,
  Error,
  Warning,
  Upload,
  History,
  Restore,
  Visibility,
  ArrowBack
} from '@mui/icons-material';

// Mock data for existing blog - in real app, you'd fetch this from API
const mockBlogData = {
  id: 1,
  title: 'Getting Started with React Hooks',
  slug: 'getting-started-with-react-hooks',
  excerpt: 'Learn how to use React Hooks in your applications. A comprehensive guide for beginners.',
  body: '<h1>React Hooks Tutorial</h1>\n<p>React Hooks revolutionized how we write React components...</p>\n<h2>What are React Hooks?</h2>\n<p>React Hooks are functions that let you "hook into" React state and lifecycle features from function components.</p>\n<h2>Benefits of Using Hooks</h2>\n<p>Hooks allow you to reuse stateful logic without changing your component hierarchy...</p>',
  blog_type: 'blog',
  status: 'published',
  seo_title: 'React Hooks Tutorial for Beginners - Complete Guide 2024',
  meta_description: 'Learn how to use React Hooks in your applications with this comprehensive tutorial. Perfect for beginners looking to master modern React development.',
  canonical_url: 'https://example.com/blog/react-hooks-tutorial',
  primary_keyword: 'react hooks',
  secondary_keywords: ['react', 'javascript', 'tutorial', 'frontend development', 'web development'],
  search_intent: 'informational',
  featured_image: null,
  featured_image_alt: '',
  scheduled_publish_at: null,
  is_featured: true,
  word_count: 850,
  reading_time_minutes: 5,
  view_count: 1250,
  author_name: 'John Doe',
  published_at: '2024-01-15T09:30:00Z',
  created_at: '2024-01-10T10:00:00Z',
  updated_at: '2024-01-14T15:30:00Z',
  seo_indicators: {
    seo_score: 78,
    meta_title_optimal: true,
    meta_description_optimal: true,
    has_featured_image: false,
    reading_time: 5
  }
};

const UpdateBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get blog ID from URL
  const [activeTab, setActiveTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    blogType: 'blog',
    status: 'draft',
    seoTitle: '',
    metaDescription: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    searchIntent: 'informational',
    featuredImage: null,
    featuredImageAlt: '',
    internalLinks: [],
    scheduledPublish: '',
    isFeatured: false,
    canonicalUrl: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Load blog data on component mount
  useEffect(() => {
    const loadBlogData = async () => {
      // In real app: fetch blog data from API using the id
      console.log('Loading blog with ID:', id);
      
      // Use mock data for now
      const blogData = mockBlogData;
      
      setOriginalData(blogData);
      
      // Transform API data to form state
      setFormData({
        title: blogData.title || '',
        excerpt: blogData.excerpt || '',
        content: blogData.body || '',
        blogType: blogData.blog_type || 'blog',
        status: blogData.status || 'draft',
        seoTitle: blogData.seo_title || '',
        metaDescription: blogData.meta_description || '',
        primaryKeyword: blogData.primary_keyword || '',
        secondaryKeywords: blogData.secondary_keywords || [],
        searchIntent: blogData.search_intent || 'informational',
        featuredImage: blogData.featured_image,
        featuredImageAlt: blogData.featured_image_alt || '',
        internalLinks: blogData.internal_links || [],
        scheduledPublish: blogData.scheduled_publish_at || '',
        isFeatured: blogData.is_featured || false,
        canonicalUrl: blogData.canonical_url || '',
      });

      // Load mock version history
      setVersionHistory([
        {
          id: 1,
          version: '2.0',
          date: '2024-01-14T15:30:00Z',
          author: 'John Doe',
          changes: ['Updated content', 'Added new sections', 'Fixed typos'],
          content: blogData.body
        },
        {
          id: 2,
          version: '1.0',
          date: '2024-01-10T10:00:00Z',
          author: 'John Doe',
          changes: ['Initial draft'],
          content: '<h1>Initial Draft</h1><p>First version of the article...</p>'
        }
      ]);
    };

    loadBlogData();
  }, [id]);

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.title !== originalData.title ||
      formData.excerpt !== originalData.excerpt ||
      formData.content !== originalData.body ||
      formData.blogType !== originalData.blog_type ||
      formData.status !== originalData.status ||
      formData.seoTitle !== originalData.seo_title ||
      formData.metaDescription !== originalData.meta_description ||
      formData.primaryKeyword !== originalData.primary_keyword ||
      JSON.stringify(formData.secondaryKeywords) !== JSON.stringify(originalData.secondary_keywords) ||
      formData.searchIntent !== originalData.search_intent ||
      formData.featuredImageAlt !== originalData.featured_image_alt ||
      formData.scheduledPublish !== originalData.scheduled_publish_at ||
      formData.isFeatured !== originalData.is_featured ||
      formData.canonicalUrl !== originalData.canonical_url
    );
  };

  // Helper functions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          featuredImage: 'Please upload a valid image (JPEG, PNG, GIF, WebP)' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          featuredImage: 'Image size should be less than 5MB' 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, featuredImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.featuredImage) {
        setErrors(prev => ({ ...prev, featuredImage: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: null, featuredImageAlt: '' }));
    setImagePreview(null);
  };

  const addSecondaryKeyword = () => {
    const keyword = prompt('Enter a secondary keyword:');
    if (keyword && keyword.trim()) {
      setFormData(prev => ({
        ...prev,
        secondaryKeywords: [...prev.secondaryKeywords, keyword.trim()]
      }));
    }
  };

  const removeSecondaryKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter((_, i) => i !== index)
    }));
  };

  const addInternalLink = () => {
    const newLink = {
      id: Date.now(),
      title: '',
      url: '',
      anchor: ''
    };
    setFormData(prev => ({
      ...prev,
      internalLinks: [...prev.internalLinks, newLink]
    }));
  };

  const updateInternalLink = (index, field, value) => {
    const updatedLinks = [...formData.internalLinks];
    updatedLinks[index][field] = value;
    setFormData(prev => ({ ...prev, internalLinks: updatedLinks }));
  };

  const removeInternalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      internalLinks: prev.internalLinks.filter((_, i) => i !== index)
    }));
  };

  const restoreVersion = (version) => {
    if (window.confirm(`Restore to version ${version.version}? This will replace your current content.`)) {
      setFormData(prev => ({
        ...prev,
        content: version.content
      }));
      setShowHistory(false);
      alert(`Restored to version ${version.version}`);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 200) newErrors.title = 'Title should be less than 200 characters';
    
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.content.length < 100) newErrors.content = 'Content should be at least 100 characters';
    
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEO title should be 60 characters or less';
    }
    
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be 160 characters or less';
    }
    
    if (!formData.primaryKeyword.trim()) newErrors.primaryKeyword = 'Primary keyword is required';
    
    if (formData.status === 'scheduled' && !formData.scheduledPublish) {
      newErrors.scheduledPublish = 'Scheduled publish date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SEO Analysis
  const getSeoAnalysis = () => {
    const analysis = {
      titleLength: formData.title.length,
      titleOptimal: formData.title.length >= 50 && formData.title.length <= 60,
      descriptionLength: formData.metaDescription.length,
      descriptionOptimal: formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160,
      hasImage: !!formData.featuredImage,
      hasImageAlt: !!formData.featuredImageAlt,
      wordCount: formData.content.split(/\s+/).filter(word => word.length > 0).length,
      readingTime: Math.max(1, Math.floor(formData.content.split(/\s+/).filter(word => word.length > 0).length / 200)),
    };

    // Calculate SEO score
    let score = 0;
    if (analysis.titleOptimal) score += 20;
    if (analysis.descriptionOptimal) score += 20;
    if (analysis.hasImage) score += 10;
    if (analysis.hasImageAlt) score += 10;
    if (analysis.wordCount >= 300) score += 20;
    if (formData.primaryKeyword) score += 10;
    if (formData.secondaryKeywords.length > 0) score += 10;

    analysis.seoScore = Math.min(100, score);
    analysis.seoLevel = analysis.seoScore >= 80 ? 'Excellent' : 
                        analysis.seoScore >= 60 ? 'Good' : 
                        'Needs Improvement';

    return analysis;
  };

  const seoAnalysis = getSeoAnalysis();

  // Save handlers
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Updating draft:', {
      id,
      ...formData,
      status: 'draft'
    });
    
    setSaving(false);
    alert('Draft updated successfully!');
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before updating');
      return;
    }

    setPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Updating blog:', {
      id,
      ...formData,
      status: formData.status === 'draft' ? 'draft' : formData.status,
      updated_at: new Date().toISOString()
    });
    
    setPublishing(false);
    alert('Blog updated successfully!');
    navigate('/dashboard/crud-page/view-blog');
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before scheduling');
      return;
    }

    if (!formData.scheduledPublish) {
      setErrors(prev => ({ ...prev, scheduledPublish: 'Please select a publish date' }));
      return;
    }

    setPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Scheduling update:', {
      id,
      ...formData,
      status: 'scheduled',
      scheduled_publish_at: formData.scheduledPublish
    });
    
    setPublishing(false);
    alert('Blog scheduled successfully!');
    navigate('/dashboard/crud-page/view-blog');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard/crud-page/view-blog')}
                className="mr-4 p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ArrowBack className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
                  Edit Blog Post
                </h1>
                <p className="text-gray-600 mt-2">
                  Update and optimize your existing blog post
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => navigate(`/blog/${mockBlogData.slug}`)}
                target="_blank"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                <Visibility className="w-5 h-5 mr-2" />
                View Live
              </button>
              
              <button
                onClick={handleSaveDraft}
                disabled={saving || !hasChanges()}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <DraftsIcon className="w-5 h-5 mr-2" />
                    Save Draft
                  </>
                )}
              </button>
              
              {formData.status === 'scheduled' ? (
                <button
                  onClick={handleSchedule}
                  disabled={publishing || !hasChanges()}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <ScheduleIcon className="w-5 h-5 mr-2" />
                      Schedule Update
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleUpdate}
                  disabled={publishing || !hasChanges()}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <PublishIcon className="w-5 h-5 mr-2" />
                      Update Post
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Blog Info Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">ID:</span>
                    <span className="font-medium text-gray-900">#{mockBlogData.id}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Slug:</span>
                    <span className="font-medium text-gray-900">{mockBlogData.slug}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Views:</span>
                    <span className="font-medium text-emerald-700">{mockBlogData.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Created:</span>
                    <span className="font-medium text-gray-900">{formatDate(mockBlogData.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Updated:</span>
                    <span className="font-medium text-gray-900">{formatDate(mockBlogData.updated_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Published:</span>
                    <span className="font-medium text-gray-900">{formatDate(mockBlogData.published_at)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Version History ({versionHistory.length})
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all changes?')) {
                        setFormData({
                          title: originalData?.title || '',
                          excerpt: originalData?.excerpt || '',
                          content: originalData?.body || '',
                          blogType: originalData?.blog_type || 'blog',
                          status: originalData?.status || 'draft',
                          seoTitle: originalData?.seo_title || '',
                          metaDescription: originalData?.meta_description || '',
                          primaryKeyword: originalData?.primary_keyword || '',
                          secondaryKeywords: originalData?.secondary_keywords || [],
                          searchIntent: originalData?.search_intent || 'informational',
                          featuredImage: originalData?.featured_image,
                          featuredImageAlt: originalData?.featured_image_alt || '',
                          internalLinks: originalData?.internal_links || [],
                          scheduledPublish: originalData?.scheduled_publish_at || '',
                          isFeatured: originalData?.is_featured || false,
                          canonicalUrl: originalData?.canonical_url || '',
                        });
                      }
                    }}
                    disabled={!hasChanges()}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Restore className="w-4 h-4 mr-2" />
                    Reset Changes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Changes Indicator */}
            {hasChanges() && (
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center">
                  <Warning className="w-5 h-5 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-amber-800">
                    You have unsaved changes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status and Settings Bar */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg p-4 mb-6 border border-emerald-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                {/* Blog Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Blog Type
                  </label>
                  <select
                    name="blogType"
                    value={formData.blogType}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="blog">Blog Post</option>
                    <option value="white_paper">White Paper</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 flex items-center text-sm text-gray-700">
                    {formData.isFeatured ? (
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    ) : (
                      <StarBorder className="w-4 h-4 text-gray-400 mr-1" />
                    )}
                    Featured Post
                  </label>
                </div>
              </div>

              {/* Scheduled Publish */}
              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Scheduled Publish
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledPublish"
                    value={formData.scheduledPublish}
                    onChange={handleInputChange}
                    className={`block w-full border ${errors.scheduledPublish ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                  />
                  {errors.scheduledPublish && (
                    <p className="mt-1 text-xs text-red-600">{errors.scheduledPublish}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
              onClick={() => setShowHistory(false)}
            />
            
            {/* Modal */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <History className="w-5 h-5 mr-2 text-emerald-600" />
                    Version History
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Clear className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {versionHistory.map((version) => (
                    <div key={version.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Version {version.version}</span>
                            <span className="text-sm text-gray-500 ml-3">
                              {formatDate(version.date)} • By {version.author}
                            </span>
                          </div>
                          <button
                            onClick={() => restoreVersion(version)}
                            className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Restore className="w-4 h-4 inline mr-1" />
                            Restore
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Changes:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {version.changes.map((change, idx) => (
                              <li key={idx} className="text-sm text-gray-600">{change}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: version.content.substring(0, 500) + '...' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Form */}
          <div className="lg:w-2/3">
            {/* Navigation Tabs */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg mb-6 border border-emerald-100 overflow-hidden">
              <div className="border-b border-emerald-100">
                <nav className="flex">
                  {['content', 'seo', 'settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                        activeTab === tab 
                          ? 'text-emerald-600 border-b-2 border-emerald-500' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        {tab === 'content' && <Description className="w-5 h-5" />}
                        {tab === 'seo' && <TrendingUp className="w-5 h-5" />}
                        {tab === 'settings' && <Language className="w-5 h-5" />}
                        <span className="capitalize">{tab}</span>
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TitleIcon className="w-4 h-4 inline mr-2" />
                        Blog Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter a compelling title for your blog post"
                        className={`block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{formData.title.length}/200 characters</span>
                        <span className={formData.title.length >= 50 && formData.title.length <= 60 ? 'text-emerald-600' : 'text-amber-600'}>
                          {formData.title.length >= 50 && formData.title.length <= 60 ? '✓ Optimal' : '50-60 chars recommended'}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Description className="w-4 h-4 inline mr-2" />
                        Excerpt
                      </label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Write a short summary of your blog post"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        {formData.excerpt.length}/300 characters
                      </div>
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TextFields className="w-4 h-4 inline mr-2" />
                        Content *
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows="12"
                        placeholder="Write your blog content here. You can use HTML tags for formatting."
                        className={`block w-full border ${errors.content ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white font-mono`}
                      />
                      {errors.content && (
                        <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                      )}
                      <div className="mt-2 flex flex-wrap justify-between text-xs text-gray-500">
                        <div className="flex space-x-4">
                          <span>Words: {seoAnalysis.wordCount}</span>
                          <span>Characters: {formData.content.length}</span>
                          <span>Reading Time: {seoAnalysis.readingTime} min</span>
                        </div>
                        <span className={seoAnalysis.wordCount >= 300 ? 'text-emerald-600' : 'text-amber-600'}>
                          {seoAnalysis.wordCount >= 300 ? '✓ Optimal length' : '300+ words recommended'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    {/* SEO Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TitleIcon className="w-4 h-4 inline mr-2" />
                        SEO Title
                      </label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleInputChange}
                        placeholder="Custom SEO title (defaults to blog title)"
                        className={`block w-full border ${errors.seoTitle ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.seoTitle && (
                        <p className="mt-2 text-sm text-red-600">{errors.seoTitle}</p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{formData.seoTitle.length}/60 characters</span>
                        <span className={seoAnalysis.titleOptimal ? 'text-emerald-600' : 'text-amber-600'}>
                          {seoAnalysis.titleOptimal ? '✓ Optimal' : '50-60 chars recommended'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Description className="w-4 h-4 inline mr-2" />
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Write a compelling meta description for search engines"
                        className={`block w-full border ${errors.metaDescription ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.metaDescription && (
                        <p className="mt-2 text-sm text-red-600">{errors.metaDescription}</p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{formData.metaDescription.length}/160 characters</span>
                        <span className={seoAnalysis.descriptionOptimal ? 'text-emerald-600' : 'text-amber-600'}>
                          {seoAnalysis.descriptionOptimal ? '✓ Optimal' : '120-160 chars recommended'}
                        </span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Primary Keyword *
                      </label>
                      <input
                        type="text"
                        name="primaryKeyword"
                        value={formData.primaryKeyword}
                        onChange={handleInputChange}
                        placeholder="Enter the main keyword for SEO"
                        className={`block w-full border ${errors.primaryKeyword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.primaryKeyword && (
                        <p className="mt-2 text-sm text-red-600">{errors.primaryKeyword}</p>
                      )}
                    </div>

                    {/* Secondary Keywords */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          <TrendingUp className="w-4 h-4 inline mr-2" />
                          Secondary Keywords
                        </label>
                        <button
                          type="button"
                          onClick={addSecondaryKeyword}
                          className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          + Add Keyword
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.secondaryKeywords.map((keyword, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={keyword}
                              readOnly
                              className="flex-1 border border-gray-300 rounded-l-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-gray-50"
                            />
                            <button
                              type="button"
                              onClick={() => removeSecondaryKeyword(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-r-lg hover:bg-red-200 transition-colors"
                            >
                              <Clear className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.secondaryKeywords.length === 0 && (
                          <p className="text-sm text-gray-500 italic py-2">
                            No secondary keywords added yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Search Intent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Intent
                      </label>
                      <select
                        name="searchIntent"
                        value={formData.searchIntent}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                      >
                        <option value="informational">Informational</option>
                        <option value="commercial">Commercial</option>
                        <option value="transactional">Transactional</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Featured Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Featured Image
                      </label>
                      
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="relative rounded-lg overflow-hidden border border-gray-300">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <Clear className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Image Alt Text */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Image Alt Text *
                            </label>
                            <input
                              type="text"
                              name="featuredImageAlt"
                              value={formData.featuredImageAlt}
                              onChange={handleInputChange}
                              placeholder="Describe the image for accessibility and SEO"
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                            />
                            {!formData.featuredImageAlt && (
                              <p className="mt-1 text-xs text-amber-600">
                                Alt text is required for accessibility
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                          <input
                            type="file"
                            id="featuredImage"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label htmlFor="featuredImage" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <AddPhotoAlternate className="w-12 h-12 text-gray-400 mb-3" />
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Click to upload featured image
                              </p>
                              <p className="text-xs text-gray-500">
                                Recommended: 1200x630px, JPEG/PNG/WEBP, max 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                      {errors.featuredImage && (
                        <p className="mt-2 text-sm text-red-600">{errors.featuredImage}</p>
                      )}
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <LinkIcon className="w-4 h-4 inline mr-2" />
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        name="canonicalUrl"
                        value={formData.canonicalUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/original-post-url"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For duplicate content. Leave empty if this is the original post.
                      </p>
                    </div>

                    {/* Internal Links */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          <InsertLink className="w-4 h-4 inline mr-2" />
                          Internal Links
                        </label>
                        <button
                          type="button"
                          onClick={addInternalLink}
                          className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          + Add Link
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.internalLinks.map((link, index) => (
                          <div key={link.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => updateInternalLink(index, 'title', e.target.value)}
                                  placeholder="Link title"
                                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Anchor Text
                                </label>
                                <input
                                  type="text"
                                  value={link.anchor}
                                  onChange={(e) => updateInternalLink(index, 'anchor', e.target.value)}
                                  placeholder="Click here"
                                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                                />
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                URL
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateInternalLink(index, 'url', e.target.value)}
                                placeholder="https://example.com/related-post"
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeInternalLink(index)}
                                className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {formData.internalLinks.length === 0 && (
                          <p className="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                            No internal links added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - SEO Analysis & Preview */}
          <div className="lg:w-1/3">
            {/* SEO Analysis Card */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg mb-6 border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  SEO Analysis
                </h3>
              </div>
              
              <div className="p-6">
                {/* SEO Score */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className={`${
                          seoAnalysis.seoScore >= 80 ? 'text-emerald-100' :
                          seoAnalysis.seoScore >= 60 ? 'text-amber-100' : 'text-red-100'
                        }`}
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (seoAnalysis.seoScore / 100) * 251.2}
                        strokeLinecap="round"
                        className={`${
                          seoAnalysis.seoScore >= 80 ? 'text-emerald-500' :
                          seoAnalysis.seoScore >= 60 ? 'text-amber-500' : 'text-red-500'
                        } transition-all duration-500 ease-out`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold ${
                        seoAnalysis.seoScore >= 80 ? 'text-emerald-600' :
                        seoAnalysis.seoScore >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {seoAnalysis.seoScore}
                      </span>
                      <span className="text-xs font-medium text-gray-600">Score</span>
                    </div>
                  </div>
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    seoAnalysis.seoScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    seoAnalysis.seoScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {seoAnalysis.seoLevel}
                  </div>
                  
                  {/* Original Score Comparison */}
                  {originalData?.seo_indicators?.seo_score && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-600">Original: </span>
                      <span className={`font-medium ${
                        seoAnalysis.seoScore > originalData.seo_indicators.seo_score ? 'text-emerald-600' :
                        seoAnalysis.seoScore < originalData.seo_indicators.seo_score ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {originalData.seo_indicators.seo_score}%
                        {seoAnalysis.seoScore > originalData.seo_indicators.seo_score && ' ↗'}
                        {seoAnalysis.seoScore < originalData.seo_indicators.seo_score && ' ↘'}
                      </span>
                    </div>
                  )}
                </div>

                {/* SEO Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {seoAnalysis.titleOptimal ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      ) : (
                        <Warning className="w-5 h-5 text-amber-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Title Length</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      seoAnalysis.titleOptimal ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {formData.title.length}/60
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {seoAnalysis.descriptionOptimal ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      ) : (
                        <Warning className="w-5 h-5 text-amber-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Meta Description</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      seoAnalysis.descriptionOptimal ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {formData.metaDescription.length}/160
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {seoAnalysis.hasImage ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      ) : (
                        <Warning className="w-5 h-5 text-amber-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Featured Image</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      seoAnalysis.hasImage ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {seoAnalysis.hasImage ? 'Added' : 'Missing'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {seoAnalysis.hasImageAlt ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      ) : seoAnalysis.hasImage ? (
                        <Warning className="w-5 h-5 text-amber-500 mr-2" />
                      ) : (
                        <Error className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Image Alt Text</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      seoAnalysis.hasImageAlt ? 'text-emerald-600' : 
                      seoAnalysis.hasImage ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {seoAnalysis.hasImageAlt ? 'Added' : 
                       seoAnalysis.hasImage ? 'Missing' : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {seoAnalysis.wordCount >= 300 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      ) : (
                        <Warning className="w-5 h-5 text-amber-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Content Length</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      seoAnalysis.wordCount >= 300 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {seoAnalysis.wordCount} words
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <AccessTime className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Reading Time</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {seoAnalysis.readingTime} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving || !hasChanges()}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DraftsIcon className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  {formData.status === 'scheduled' ? (
                    <button
                      onClick={handleSchedule}
                      disabled={publishing || !hasChanges()}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ScheduleIcon className="w-5 h-5 mr-2" />
                      {publishing ? 'Scheduling...' : 'Schedule Update'}
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdate}
                      disabled={publishing || !hasChanges()}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PublishIcon className="w-5 h-5 mr-2" />
                      {publishing ? 'Updating...' : 'Update Post'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowHistory(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    <History className="w-5 h-5 mr-2" />
                    View Version History
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard/crud-page/view-blog')}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Blog List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlogPage;
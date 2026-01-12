import React, { useState } from 'react';
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
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  Error,
  Warning,
  Upload,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/blogs/api/';

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    blog_type: 'blog',
    status: 'draft',
    seo_title: '',
    meta_description: '',
    primary_keyword: '',
    secondary_keywords: [],
    search_intent: 'informational',
    featured_image: null,
    featured_image_alt: '',
    internal_links: [],
    scheduled_publish_at: '',
    is_featured: false,
    canonical_url: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
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
    // Clear API error when user modifies form
    if (apiError) {
      setApiError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
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
          featured_image: 'Please upload a valid image (JPEG, PNG, GIF, WebP)' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          featured_image: 'Image size should be less than 5MB' 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, featured_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.featured_image) {
        setErrors(prev => ({ ...prev, featured_image: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featured_image: null, featured_image_alt: '' }));
    setImagePreview(null);
  };

  const addSecondaryKeyword = () => {
    const keyword = prompt('Enter a secondary keyword:');
    if (keyword && keyword.trim()) {
      setFormData(prev => ({
        ...prev,
        secondary_keywords: [...prev.secondary_keywords, keyword.trim()]
      }));
    }
  };

  const removeSecondaryKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      secondary_keywords: prev.secondary_keywords.filter((_, i) => i !== index)
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
      internal_links: [...prev.internal_links, newLink]
    }));
  };

  const updateInternalLink = (index, field, value) => {
    const updatedLinks = [...formData.internal_links];
    updatedLinks[index][field] = value;
    setFormData(prev => ({ ...prev, internal_links: updatedLinks }));
  };

  const removeInternalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      internal_links: prev.internal_links.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 200) newErrors.title = 'Title should be less than 200 characters';
    
    if (!formData.body.trim()) newErrors.body = 'Content is required';
    if (formData.body.length < 100) newErrors.body = 'Content should be at least 100 characters';
    
    if (formData.seo_title && formData.seo_title.length > 60) {
      newErrors.seo_title = 'SEO title should be 60 characters or less';
    }
    
    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description should be 160 characters or less';
    }
    
    if (!formData.primary_keyword.trim()) newErrors.primary_keyword = 'Primary keyword is required';
    
    if (formData.status === 'scheduled' && !formData.scheduled_publish_at) {
      newErrors.scheduled_publish_at = 'Scheduled publish date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SEO Analysis
  const getSeoAnalysis = () => {
    const analysis = {
      titleLength: formData.title.length,
      titleOptimal: formData.title.length >= 50 && formData.title.length <= 60,
      descriptionLength: formData.meta_description.length,
      descriptionOptimal: formData.meta_description.length >= 120 && formData.meta_description.length <= 160,
      hasImage: !!formData.featured_image,
      hasImageAlt: !!formData.featured_image_alt,
      wordCount: formData.body.split(/\s+/).filter(word => word.length > 0).length,
      readingTime: Math.max(1, Math.floor(formData.body.split(/\s+/).filter(word => word.length > 0).length / 200)),
    };

    // Calculate SEO score
    let score = 0;
    if (analysis.titleOptimal) score += 20;
    if (analysis.descriptionOptimal) score += 20;
    if (analysis.hasImage) score += 10;
    if (analysis.hasImageAlt) score += 10;
    if (analysis.wordCount >= 300) score += 20;
    if (formData.primary_keyword) score += 10;
    if (formData.secondary_keywords.length > 0) score += 10;

    analysis.seoScore = Math.min(100, score);
    analysis.seoLevel = analysis.seoScore >= 80 ? 'Excellent' : 
                        analysis.seoScore >= 60 ? 'Good' : 
                        'Needs Improvement';

    return analysis;
  };

  const seoAnalysis = getSeoAnalysis();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // Format data for API
  const formatDataForApi = (status) => {
    const data = {
      title: formData.title,
      excerpt: formData.excerpt,
      body: formData.body,
      blog_type: formData.blog_type,
      status: status,
      seo_title: formData.seo_title,
      meta_description: formData.meta_description,
      primary_keyword: formData.primary_keyword,
      secondary_keywords: formData.secondary_keywords,
      search_intent: formData.search_intent,
      featured_image_alt: formData.featured_image_alt,
      internal_links: formData.internal_links.map(link => ({
        title: link.title,
        url: link.url,
        anchor: link.anchor
      })),
      is_featured: formData.is_featured,
      canonical_url: formData.canonical_url,
    };

    // Add scheduled publish date if scheduled
    if (status === 'scheduled' && formData.scheduled_publish_at) {
      data.scheduled_publish_at = formData.scheduled_publish_at;
    }

    return data;
  };

  // Create FormData for image upload
  const createFormData = (apiData) => {
    const formDataObj = new FormData();
    
    // Append all text fields
    Object.keys(apiData).forEach(key => {
      if (key === 'secondary_keywords' || key === 'internal_links') {
        // Convert arrays to JSON strings
        formDataObj.append(key, JSON.stringify(apiData[key]));
      } else if (apiData[key] !== null && apiData[key] !== undefined) {
        formDataObj.append(key, apiData[key]);
      }
    });

    // Append image file if exists
    if (formData.featured_image) {
      formDataObj.append('featured_image', formData.featured_image);
    }

    return formDataObj;
  };

  // API call to create blog
  const createBlog = async (status) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const apiData = formatDataForApi(status);
      const formDataObj = createFormData(apiData);

      console.log('📤 Creating blog with data:', apiData);
      console.log('📤 FormData entries:');
      for (let pair of formDataObj.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      const response = await fetch(`${API_BASE_URL}blogs/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it automatically with boundary
        },
        body: formDataObj,
      });

      console.log('📥 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ API error response:', data);
        throw new Error(data.error || data.message || data.detail || `HTTP ${response.status}: Failed to create blog`);
      }

      console.log('✅ Blog created successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error creating blog:', error);
      throw error;
    }
  };

  // Save handlers
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await createBlog('draft');
      setSuccessMessage('Draft saved successfully!');
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        navigate('/dashboard/cms_crud/view_blogs');
      }, 3000);

    } catch (error) {
      setApiError(error.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before publishing');
      return;
    }

    setPublishing(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await createBlog('published');
      setSuccessMessage('Blog published successfully! Redirecting...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/cms_crud/view_blogs');
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Failed to publish blog');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before scheduling');
      return;
    }

    if (!formData.scheduled_publish_at) {
      setErrors(prev => ({ ...prev, scheduled_publish_at: 'Please select a publish date' }));
      setApiError('Please select a scheduled publish date');
      return;
    }

    // Validate scheduled date is in future
    const scheduledDate = new Date(formData.scheduled_publish_at);
    if (scheduledDate <= new Date()) {
      setApiError('Scheduled publish date must be in the future');
      return;
    }

    setPublishing(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await createBlog('scheduled');
      setSuccessMessage('Blog scheduled successfully! Redirecting...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/cms_crud/view_blogs');
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Failed to schedule blog');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/dashboard/cms_crud/view_blogs')}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowBack className="w-4 h-4 mr-2" />
                Back to Blogs
              </button>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
                Create New Blog
              </h1>
              <p className="text-gray-600 mt-2">
                Create and publish a new blog post with SEO optimization
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
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
                  disabled={publishing}
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
                      Schedule
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <PublishIcon className="w-5 h-5 mr-2" />
                      Publish Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {apiError && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <Error className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{apiError}</p>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                <div>
                  <p className="font-medium text-emerald-800">Success!</p>
                  <p className="text-sm text-emerald-600 mt-1">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

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
                    name="blog_type"
                    value={formData.blog_type}
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
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 flex items-center text-sm text-gray-700">
                    {formData.is_featured ? (
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
                    name="scheduled_publish_at"
                    value={formData.scheduled_publish_at}
                    onChange={handleInputChange}
                    className={`block w-full border ${errors.scheduled_publish_at ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                  />
                  {errors.scheduled_publish_at && (
                    <p className="mt-1 text-xs text-red-600">{errors.scheduled_publish_at}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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
                        placeholder="Write a short summary of your blog post (used for meta description if not provided)"
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
                        name="body"
                        value={formData.body}
                        onChange={handleInputChange}
                        rows="12"
                        placeholder="Write your blog content here. You can use HTML tags for formatting."
                        className={`block w-full border ${errors.body ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white font-mono`}
                      />
                      {errors.body && (
                        <p className="mt-2 text-sm text-red-600">{errors.body}</p>
                      )}
                      <div className="mt-2 flex flex-wrap justify-between text-xs text-gray-500">
                        <div className="flex space-x-4">
                          <span>Words: {seoAnalysis.wordCount}</span>
                          <span>Characters: {formData.body.length}</span>
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
                        name="seo_title"
                        value={formData.seo_title}
                        onChange={handleInputChange}
                        placeholder="Custom SEO title (defaults to blog title)"
                        className={`block w-full border ${errors.seo_title ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.seo_title && (
                        <p className="mt-2 text-sm text-red-600">{errors.seo_title}</p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{formData.seo_title.length}/60 characters</span>
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
                        name="meta_description"
                        value={formData.meta_description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Write a compelling meta description for search engines"
                        className={`block w-full border ${errors.meta_description ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.meta_description && (
                        <p className="mt-2 text-sm text-red-600">{errors.meta_description}</p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{formData.meta_description.length}/160 characters</span>
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
                        name="primary_keyword"
                        value={formData.primary_keyword}
                        onChange={handleInputChange}
                        placeholder="Enter the main keyword for SEO"
                        className={`block w-full border ${errors.primary_keyword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white`}
                      />
                      {errors.primary_keyword && (
                        <p className="mt-2 text-sm text-red-600">{errors.primary_keyword}</p>
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
                        {formData.secondary_keywords.map((keyword, index) => (
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
                        {formData.secondary_keywords.length === 0 && (
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
                        name="search_intent"
                        value={formData.search_intent}
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
                              name="featured_image_alt"
                              value={formData.featured_image_alt}
                              onChange={handleInputChange}
                              placeholder="Describe the image for accessibility and SEO"
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                            />
                            {!formData.featured_image_alt && (
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
                            id="featured_image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label htmlFor="featured_image" className="cursor-pointer">
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
                      {errors.featured_image && (
                        <p className="mt-2 text-sm text-red-600">{errors.featured_image}</p>
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
                        name="canonical_url"
                        value={formData.canonical_url}
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
                        {formData.internal_links.map((link, index) => (
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
                        
                        {formData.internal_links.length === 0 && (
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
                      {formData.meta_description.length}/160
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
                    disabled={saving}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DraftsIcon className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  {formData.status === 'scheduled' ? (
                    <button
                      onClick={handleSchedule}
                      disabled={publishing}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ScheduleIcon className="w-5 h-5 mr-2" />
                      {publishing ? 'Scheduling...' : 'Schedule Post'}
                    </button>
                  ) : (
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PublishIcon className="w-5 h-5 mr-2" />
                      {publishing ? 'Publishing...' : 'Publish Now'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/dashboard/cms_crud/view_blogs')}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    View All Blogs
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

export default CreateBlogPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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

// API Configuration
const API_BASE_URL = 'https://cms-api.ontapke.com/blogs/api/';

// Create axios instance
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

// Helper function to format datetime for HTML input (from ISO to datetime-local)
const formatDateTimeForInput = (datetimeString) => {
  if (!datetimeString) return '';
  
  try {
    // If it's already in the right format, return as is
    if (datetimeString.includes('T') && datetimeString.length === 16) {
      return datetimeString;
    }
    
    // Parse the ISO datetime string
    const date = new Date(datetimeString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format to YYYY-MM-DDTHH:mm (HTML datetime-local format)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

// Helper function to format datetime for API submission (from datetime-local to ISO)
const formatDateTimeForAPI = (datetimeString) => {
  if (!datetimeString) return null;
  
  try {
    // If it's already in ISO format, return as is
    if (datetimeString.includes('T') && datetimeString.length > 19) {
      return datetimeString;
    }
    
    // Add seconds and timezone if missing
    let formattedDatetime = datetimeString;
    if (formattedDatetime.length === 16) {
      // Add :00 for seconds
      formattedDatetime += ':00';
    }
    
    // Add Z for UTC timezone if no timezone specified
    if (!formattedDatetime.includes('+') && !formattedDatetime.includes('Z')) {
      formattedDatetime += 'Z';
    }
    
    return formattedDatetime;
  } catch (error) {
    console.error('Error formatting datetime for API:', error);
    return datetimeString;
  }
};

const UpdateBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get blog ID from URL
  const [activeTab, setActiveTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [apiError, setApiError] = useState(null);
  
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
  
  // Load blog data on component mount
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        console.log('Loading blog with ID:', id);
        
        // Fetch blog data from API
        const response = await api.get(`blogs/${id}/`);
        const blogData = response.data.blog; // Extract the blog object from response
        
        console.log('Blog data loaded:', blogData);
        
        setBlogData(blogData);
        setOriginalData(blogData);
        
        // Format scheduled_publish_at for HTML input
        const formattedScheduledDate = blogData.scheduled_publish_at 
          ? formatDateTimeForInput(blogData.scheduled_publish_at)
          : '';
        
        // Transform API data to form state
        setFormData({
          title: blogData.title || '',
          excerpt: blogData.excerpt || '',
          body: blogData.body || '',
          blog_type: blogData.blog_type || 'blog',
          status: blogData.status || 'draft',
          seo_title: blogData.seo_title || '',
          meta_description: blogData.meta_description || '',
          primary_keyword: blogData.primary_keyword || '',
          secondary_keywords: blogData.secondary_keywords || [],
          search_intent: blogData.search_intent || 'informational',
          featured_image: blogData.featured_image, // Keep as URL string for now
          featured_image_alt: blogData.featured_image_alt || '',
          internal_links: blogData.internal_links || [],
          scheduled_publish_at: formattedScheduledDate,
          is_featured: blogData.is_featured || false,
          canonical_url: blogData.canonical_url || '',
        });

        // Set image preview if exists
        if (blogData.image_url) {
          setImagePreview(blogData.image_url);
        } else if (blogData.featured_image) {
          setImagePreview(blogData.featured_image);
        }

        // Load mock version history
        setVersionHistory([
          {
            id: 1,
            version: '2.0',
            date: blogData.updated_at || new Date().toISOString(),
            author: blogData.author_name || blogData.user?.first_name + ' ' + blogData.user?.last_name || 'Unknown',
            changes: ['Updated content', 'Added new sections', 'Fixed typos'],
            content: blogData.body || ''
          },
          {
            id: 2,
            version: '1.0',
            date: blogData.created_at || new Date().toISOString(),
            author: blogData.author_name || blogData.user?.first_name + ' ' + blogData.user?.last_name || 'Unknown',
            changes: ['Initial draft'],
            content: blogData.body || ''
          }
        ]);
        
      } catch (error) {
        console.error('Error loading blog data:', error);
        setApiError(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlogData();
    }
  }, [id]);

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    
    // Compare current form data with original data
    // Need to handle scheduled_publish_at specially since we format it differently
    const originalScheduledDate = originalData.scheduled_publish_at 
      ? formatDateTimeForInput(originalData.scheduled_publish_at)
      : '';
    
    return (
      formData.title !== originalData.title ||
      formData.excerpt !== originalData.excerpt ||
      formData.body !== originalData.body ||
      formData.blog_type !== originalData.blog_type ||
      formData.status !== originalData.status ||
      formData.seo_title !== originalData.seo_title ||
      formData.meta_description !== originalData.meta_description ||
      formData.primary_keyword !== originalData.primary_keyword ||
      JSON.stringify(formData.secondary_keywords) !== JSON.stringify(originalData.secondary_keywords) ||
      formData.search_intent !== originalData.search_intent ||
      formData.featured_image_alt !== originalData.featured_image_alt ||
      formData.scheduled_publish_at !== originalScheduledDate ||
      formData.is_featured !== originalData.is_featured ||
      formData.canonical_url !== originalData.canonical_url
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

  const restoreVersion = (version) => {
    if (window.confirm(`Restore to version ${version.version}? This will replace your current content.`)) {
      setFormData(prev => ({
        ...prev,
        body: version.content
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
      hasImage: !!formData.featured_image || !!imagePreview,
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

  // Handle form submission for updating blog
  const handleUpdateBlog = async (status = null) => {
    if (!validateForm()) {
      alert('Please fix the errors before updating');
      return;
    }

    try {
      setPublishing(true);
      setApiError(null);
      
      // Prepare form data - create a new object to avoid mutating formData
      const updateData = {
        title: formData.title,
        excerpt: formData.excerpt,
        body: formData.body,
        blog_type: formData.blog_type,
        status: status || formData.status,
        seo_title: formData.seo_title,
        meta_description: formData.meta_description,
        primary_keyword: formData.primary_keyword,
        secondary_keywords: formData.secondary_keywords,
        search_intent: formData.search_intent,
        featured_image_alt: formData.featured_image_alt,
        internal_links: formData.internal_links,
        is_featured: formData.is_featured,
        canonical_url: formData.canonical_url,
      };
      
      // Format scheduled_publish_at for API
      if (formData.scheduled_publish_at) {
        updateData.scheduled_publish_at = formatDateTimeForAPI(formData.scheduled_publish_at);
      } else {
        updateData.scheduled_publish_at = null;
      }
      
      // Handle featured_image - only send if it's a File object (new upload)
      if (formData.featured_image && typeof formData.featured_image !== 'string') {
        // If it's a File object, we need to use FormData
        const formDataToSend = new FormData();
        
        // Append all fields to FormData
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== null && updateData[key] !== undefined) {
            if (key === 'secondary_keywords' || key === 'internal_links') {
              // Stringify arrays
              formDataToSend.append(key, JSON.stringify(updateData[key]));
            } else {
              formDataToSend.append(key, updateData[key]);
            }
          }
        });
        
        // Append the image file
        formDataToSend.append('featured_image', formData.featured_image);
        
        console.log('Updating blog with FormData:', Object.fromEntries(formDataToSend));
        
        // Update headers for multipart/form-data
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        };
        
        // Call update API with FormData
        const response = await api.put(`blogs/${id}/update/`, formDataToSend, config);
        console.log('Blog updated successfully:', response.data);
      } else {
        // No file upload, send as JSON
        console.log('Updating blog with JSON data:', updateData);
        
        // Call update API with JSON
        const response = await api.put(`blogs/${id}/update/`, updateData);
        console.log('Blog updated successfully:', response.data);
      }
      
      setPublishing(false);
      alert('Blog updated successfully!');
      navigate('../view-blog');
      
    } catch (error) {
      console.error('Error updating blog:', error);
      setApiError(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update blog');
      setPublishing(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await handleUpdateBlog('draft');
    } finally {
      setSaving(false);
    }
  };

  // Handle schedule
  const handleSchedule = async () => {
    if (!formData.scheduled_publish_at) {
      setErrors(prev => ({ ...prev, scheduled_publish_at: 'Please select a publish date' }));
      return;
    }
    
    try {
      await handleUpdateBlog('scheduled');
    } catch (error) {
      console.error('Error scheduling blog:', error);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    try {
      await handleUpdateBlog('published');
    } catch (error) {
      console.error('Error publishing blog:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Reset form to original data
  const resetFormData = () => {
    if (window.confirm('Reset all changes?')) {
      const formattedScheduledDate = originalData?.scheduled_publish_at 
        ? formatDateTimeForInput(originalData.scheduled_publish_at)
        : '';
      
      setFormData({
        title: originalData?.title || '',
        excerpt: originalData?.excerpt || '',
        body: originalData?.body || '',
        blog_type: originalData?.blog_type || 'blog',
        status: originalData?.status || 'draft',
        seo_title: originalData?.seo_title || '',
        meta_description: originalData?.meta_description || '',
        primary_keyword: originalData?.primary_keyword || '',
        secondary_keywords: originalData?.secondary_keywords || [],
        search_intent: originalData?.search_intent || 'informational',
        featured_image: originalData?.featured_image,
        featured_image_alt: originalData?.featured_image_alt || '',
        internal_links: originalData?.internal_links || [],
        scheduled_publish_at: formattedScheduledDate,
        is_featured: originalData?.is_featured || false,
        canonical_url: originalData?.canonical_url || '',
      });
      
      if (originalData?.image_url) {
        setImagePreview(originalData.image_url);
      } else if (originalData?.featured_image) {
        setImagePreview(originalData.featured_image);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && !blogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center">
              <Error className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h2 className="text-xl font-bold text-red-800">Failed to Load Blog</h2>
                <p className="text-red-600 mt-2">{apiError}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate('../view-blog')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Back to Blog List
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="p-6">
        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center">
              <Error className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-red-800">API Error</p>
                <p className="text-sm text-red-600 mt-1">{apiError}</p>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('../view-blog')}
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
              {blogData?.slug && (
                <button
                  onClick={() => window.open(`/blog/${blogData.slug}`, '_blank')}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                >
                  <Visibility className="w-5 h-5 mr-2" />
                  View Live
                </button>
              )}
              
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
              
              {formData.status === 'scheduled' || formData.status === 'draft' ? (
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
                  onClick={handlePublish}
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
                    <span className="font-medium text-gray-900">#{blogData?.id}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Slug:</span>
                    <span className="font-medium text-gray-900">{blogData?.slug}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Views:</span>
                    <span className="font-medium text-emerald-700">{blogData?.view_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Created:</span>
                    <span className="font-medium text-gray-900">{formatDate(blogData?.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Updated:</span>
                    <span className="font-medium text-gray-900">{formatDate(blogData?.updated_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Published:</span>
                    <span className="font-medium text-gray-900">{formatDate(blogData?.published_at)}</span>
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
                    onClick={resetFormData}
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
                    <option value="archived">Archived</option>
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

        {/* Version History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                    disabled={saving || !hasChanges()}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DraftsIcon className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  {formData.status === 'scheduled' || formData.status === 'draft' ? (
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
                      onClick={handlePublish}
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
                    onClick={() => navigate('../view-blog')}
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
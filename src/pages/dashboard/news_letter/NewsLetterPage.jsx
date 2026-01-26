// NewsLetterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsLetterPage = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvFile, setCSVFile] = useState(null);
  const [csvPreview, setCSVPreview] = useState(null);
  
  // New newsletter form
  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    html_content: '',
    plain_text_content: '',
    preview_text: '',
    categories: [],
    scheduled_for: '',
    send_to_all: false,
    custom_emails: '',
    template_id: ''
  });

  // Get authentication token
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to access newsletters');
      return '';
    }
    return token;
  };

  // Fetch newsletters
  const fetchNewsletters = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get('http://localhost:8000/newsletter/api/newsletters/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNewsletters(response.data);
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      setError('Failed to load newsletters. Please check your authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get('http://localhost:8000/newsletter/api/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get('http://localhost:8000/newsletter/api/templates/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // Create newsletter
  const createNewsletter = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = getAuthToken();
      if (!token) return;
      
      // Prepare data
      const formData = new FormData();
      formData.append('subject', newNewsletter.subject);
      formData.append('html_content', newNewsletter.html_content);
      formData.append('plain_text_content', newNewsletter.plain_text_content || '');
      formData.append('preview_text', newNewsletter.preview_text || '');
      
      // Add categories
      newNewsletter.categories.forEach(cat => {
        formData.append('categories', cat);
      });
      
      // Add recipient options
      if (newNewsletter.send_to_all) {
        formData.append('send_to_all', 'true');
      } else if (newNewsletter.custom_emails) {
        const emails = newNewsletter.custom_emails.split(',').map(email => email.trim());
        emails.forEach(email => {
          formData.append('custom_emails', email);
        });
      }
      
      // Add CSV if uploaded
      if (csvFile) {
        formData.append('csv_file', csvFile);
      }
      
      // Add schedule if set
      if (newNewsletter.scheduled_for) {
        formData.append('scheduled_for', newNewsletter.scheduled_for);
      }
      
      // Add template if selected
      if (newNewsletter.template_id) {
        formData.append('template_id', newNewsletter.template_id);
      }
      
      const response = await axios.post(
        'http://localhost:8000/newsletter/api/newsletters/create_with_recipients/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess('Newsletter created successfully!');
      setShowCreateForm(false);
      resetForm();
      fetchNewsletters();
      
    } catch (err) {
      console.error('Error creating newsletter:', err);
      setError(err.response?.data?.error || 'Failed to create newsletter');
    }
  };

  // Preview CSV
  const previewCSV = async (file) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'http://localhost:8000/newsletter/api/csv-preview/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setCSVPreview(response.data);
    } catch (err) {
      console.error('Error previewing CSV:', err);
      setError('Failed to preview CSV file');
    }
  };

  // Handle CSV file change
  const handleCSVFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Max 10MB.');
        return;
      }
      
      setCSVFile(file);
      previewCSV(file);
    }
  };

  // Schedule newsletter
  const scheduleNewsletter = async (newsletterId, scheduleDate) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.post(
        `http://localhost:8000/newsletter/api/newsletters/${newsletterId}/schedule/`,
        { scheduled_for: scheduleDate },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSuccess('Newsletter scheduled successfully!');
      fetchNewsletters();
    } catch (err) {
      console.error('Error scheduling newsletter:', err);
      setError(err.response?.data?.error || 'Failed to schedule newsletter');
    }
  };

  // Send newsletter now
  const sendNewsletterNow = async (newsletterId) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.post(
        `http://localhost:8000/newsletter/api/newsletters/${newsletterId}/send_now/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSuccess('Newsletter sending started!');
      fetchNewsletters();
    } catch (err) {
      console.error('Error sending newsletter:', err);
      setError(err.response?.data?.error || 'Failed to send newsletter');
    }
  };

  // Cancel newsletter
  const cancelNewsletter = async (newsletterId) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.post(
        `http://localhost:8000/newsletter/api/newsletters/${newsletterId}/cancel/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSuccess('Newsletter cancelled!');
      fetchNewsletters();
    } catch (err) {
      console.error('Error cancelling newsletter:', err);
      setError(err.response?.data?.error || 'Failed to cancel newsletter');
    }
  };

  // Download newsletter stats as CSV
  const downloadStatsCSV = async (newsletterId) => {
    setDownloading(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get(
        `http://localhost:8000/newsletter/api/newsletters/${newsletterId}/stats/`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter_stats_${newsletterId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Stats downloaded successfully!');
    } catch (err) {
      console.error('Error downloading stats:', err);
      setError('Failed to download statistics');
    } finally {
      setDownloading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewNewsletter({
      subject: '',
      html_content: '',
      plain_text_content: '',
      preview_text: '',
      categories: [],
      scheduled_for: '',
      send_to_all: false,
      custom_emails: '',
      template_id: ''
    });
    setCSVFile(null);
    setCSVPreview(null);
    setShowCSVUpload(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'sending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get category badge color
  const getCategoryBadge = (categoryType) => {
    const categoryColors = {
      'informational': 'bg-blue-100 text-blue-800',
      'promotional': 'bg-purple-100 text-purple-800',
      'curated': 'bg-indigo-100 text-indigo-800',
      'educational': 'bg-green-100 text-green-800',
      'product_updates': 'bg-amber-100 text-amber-800',
      'weekly_digest': 'bg-cyan-100 text-cyan-800',
      'announcements': 'bg-pink-100 text-pink-800'
    };
    
    return categoryColors[categoryType] || 'bg-gray-100 text-gray-800';
  };

  // Filter newsletters
  const filteredNewsletters = newsletters.filter(newsletter => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.preview_text?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || newsletter.status === statusFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || 
      newsletter.categories.some(cat => cat.id.toString() === categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const calculateStats = () => {
    const total = newsletters.length;
    const sent = newsletters.filter(n => n.status === 'sent').length;
    const scheduled = newsletters.filter(n => n.status === 'scheduled').length;
    const draft = newsletters.filter(n => n.status === 'draft').length;
    
    const totalRecipients = newsletters.reduce((sum, n) => sum + (n.total_recipients || 0), 0);
    const totalOpens = newsletters.reduce((sum, n) => sum + (n.open_count || 0), 0);
    
    return { total, sent, scheduled, draft, totalRecipients, totalOpens };
  };

  const stats = calculateStats();

  // Initialize
  useEffect(() => {
    fetchNewsletters();
    fetchCategories();
    fetchTemplates();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && newsletters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsletters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Newsletter Management</h1>
              <p className="text-gray-600">
                Create, schedule, and manage your newsletters. Total: <span className="font-semibold">{stats.total}</span> newsletters
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showCreateForm ? 'Cancel' : 'Create Newsletter'}
              </button>
              
              <button
                onClick={fetchNewsletters}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Newsletters</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sent</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.sent}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Recipients</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalRecipients.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create Newsletter Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Newsletter</h2>
            
            <form onSubmit={createNewsletter} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newNewsletter.subject}
                  onChange={(e) => setNewNewsletter({...newNewsletter, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter newsletter subject"
                />
              </div>
              
              {/* Preview Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={newNewsletter.preview_text}
                  onChange={(e) => setNewNewsletter({...newNewsletter, preview_text: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Short preview text for email clients"
                />
              </div>
              
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        const isSelected = newNewsletter.categories.includes(category.id);
                        if (isSelected) {
                          setNewNewsletter({
                            ...newNewsletter,
                            categories: newNewsletter.categories.filter(id => id !== category.id)
                          });
                        } else {
                          setNewNewsletter({
                            ...newNewsletter,
                            categories: [...newNewsletter.categories, category.id]
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        newNewsletter.categories.includes(category.id)
                          ? getCategoryBadge(category.type)
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Template Selection */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Template (Optional)
                  </label>
                  <select
                    value={newNewsletter.template_id}
                    onChange={(e) => setNewNewsletter({...newNewsletter, template_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content *
                </label>
                <textarea
                  required
                  value={newNewsletter.html_content}
                  onChange={(e) => setNewNewsletter({...newNewsletter, html_content: e.target.value})}
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter HTML content for your newsletter..."
                />
              </div>
              
              {/* Plain Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plain Text Content (Optional)
                </label>
                <textarea
                  value={newNewsletter.plain_text_content}
                  onChange={(e) => setNewNewsletter({...newNewsletter, plain_text_content: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Plain text version for email clients that don't support HTML..."
                />
              </div>
              
              {/* Recipient Options */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recipient Options</h3>
                
                {/* Option 1: Send to all */}
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="send_to_all"
                    checked={newNewsletter.send_to_all}
                    onChange={(e) => setNewNewsletter({...newNewsletter, send_to_all: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_to_all" className="ml-2 text-sm text-gray-700">
                    Send to all active subscribers
                  </label>
                </div>
                
                {/* Option 2: Custom emails */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter specific emails (comma-separated)
                  </label>
                  <textarea
                    value={newNewsletter.custom_emails}
                    onChange={(e) => setNewNewsletter({...newNewsletter, custom_emails: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email1@example.com, email2@example.com"
                    disabled={newNewsletter.send_to_all}
                  />
                </div>
                
                {/* Option 3: CSV Upload */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setShowCSVUpload(!showCSVUpload)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {showCSVUpload ? 'Hide CSV Upload' : 'Upload CSV with Emails'}
                  </button>
                  
                  {showCSVUpload && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      
                      {csvPreview && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-700 mb-2">CSV Preview:</h4>
                          <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {csvPreview.columns.map((col, index) => (
                                    <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {csvPreview.sample_data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {csvPreview.columns.map((col, colIndex) => (
                                      <td key={colIndex} className="px-3 py-2 text-sm text-gray-500">
                                        {row[col]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Total rows: {csvPreview.total_rows}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scheduling */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Scheduling (Optional)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule for later (leave empty to save as draft)
                  </label>
                  <input
                    type="datetime-local"
                    value={newNewsletter.scheduled_for}
                    onChange={(e) => setNewNewsletter({...newNewsletter, scheduled_for: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {newNewsletter.scheduled_for ? 'Schedule Newsletter' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search newsletters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        {/* Newsletters Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredNewsletters.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No newsletters found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first newsletter to get started!'}
              </p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Newsletter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredNewsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {newsletter.subject}
                          </div>
                          {newsletter.preview_text && (
                            <div className="text-sm text-gray-500 mt-1">
                              {newsletter.preview_text}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {newsletter.categories.map(category => (
                            <span
                              key={category.id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(category.type)}`}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(newsletter.status)}`}>
                          {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                          {newsletter.scheduled_for && newsletter.status === 'scheduled' && (
                            <span className="ml-1 text-xs">
                              ({formatDate(newsletter.scheduled_for)})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">{newsletter.total_recipients || 0} recipients</span>
                          {newsletter.sent_count > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="text-green-600">{newsletter.open_count} opens</span>
                              <span className="mx-2">•</span>
                              <span className="text-blue-600">{newsletter.click_count} clicks</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(newsletter.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* View/Edit Button */}
                          <button
                            onClick={() => {
                              // TODO: Implement edit/view functionality
                              alert(`Edit newsletter: ${newsletter.subject}`);
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                          >
                            View
                          </button>
                          
                          {/* Send Now Button (for drafts) */}
                          {newsletter.status === 'draft' && (
                            <button
                              onClick={() => sendNewsletterNow(newsletter.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                              Send Now
                            </button>
                          )}
                          
                          {/* Schedule Button (for drafts) */}
                          {newsletter.status === 'draft' && (
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setHours(date.getHours() + 24); // Tomorrow same time
                                scheduleNewsletter(newsletter.id, date.toISOString());
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Schedule
                            </button>
                          )}
                          
                          {/* Cancel Button (for scheduled) */}
                          {newsletter.status === 'scheduled' && (
                            <button
                              onClick={() => cancelNewsletter(newsletter.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          
                          {/* Stats Button (for sent) */}
                          {newsletter.status === 'sent' && (
                            <button
                              onClick={() => downloadStatsCSV(newsletter.id)}
                              disabled={downloading}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors disabled:opacity-50"
                            >
                              {downloading ? 'Downloading...' : 'Stats'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <p>
                  Showing <span className="font-semibold">{filteredNewsletters.length}</span> of{' '}
                  <span className="font-semibold">{newsletters.length}</span> newsletters
                </p>
              </div>
              <div className="text-xs text-gray-500">
                <p>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use This Page
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <p className="text-blue-700"><span className="font-semibold">Create Newsletters:</span> Click "Create Newsletter" to start a new campaign with different categories.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <p className="text-blue-700"><span className="font-semibold">Upload Recipients:</span> Use CSV upload to import email lists for targeted campaigns.</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <p className="text-blue-700"><span className="font-semibold">Schedule Delivery:</span> Send immediately or schedule for optimal timing.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">4</span>
                </div>
                <p className="text-blue-700"><span className="font-semibold">Track Performance:</span> Monitor opens, clicks, and engagement for sent newsletters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetterPage;
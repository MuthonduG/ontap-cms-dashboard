// SubscribersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState(null);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found in localStorage. Please log in first.');
      setError('Authentication required. Please log in first.');
    }
    return token || '';
  };

  // Fetch all subscribers
  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:8000/subscribers/api/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSubscribers(response.data);
      setSuccess('Subscribers loaded successfully');
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      if (err.response && err.response.status === 401) {
        setError('Session expired. Please log in again.');
        // Optional: Redirect to login
        // window.location.href = '/login';
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError('Failed to load subscribers. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:8000/subscribers/api/stats/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Download CSV - Simple version
  const downloadCSVSimple = async () => {
    setDownloading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:8000/subscribers/api/export/csv/', {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Important for file download
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename with date
      const today = new Date().toISOString().split('T')[0];
      link.download = `subscribers_all_${today}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      setSuccess('CSV file downloaded successfully!');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Download CSV with filters
  const downloadCSVFiltered = async () => {
    setDownloading(true);
    setError('');
    try {
      const token = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `http://localhost:8000/subscribers/api/export/csv/advanced/?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      
      // Create descriptive filename
      const today = new Date().toISOString().split('T')[0];
      let filename = `subscribers_filtered_${today}`;
      if (statusFilter !== 'all') filename += `_${statusFilter}`;
      if (searchTerm) filename += `_search_${searchTerm.substring(0, 10)}`;
      filename += '.csv';
      
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(urlObject);
      
      setSuccess(`Filtered CSV downloaded: ${filename}`);
    } catch (err) {
      console.error('Error downloading filtered CSV:', err);
      setError('Failed to download filtered CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Download selected subscribers as CSV
  const downloadSelectedCSV = () => {
    if (selectedRows.length === 0) {
      setError('Please select at least one subscriber to download.');
      return;
    }

    const selectedSubscribers = subscribers.filter(sub => selectedRows.includes(sub.id));
    
    // Create CSV content
    const headers = ['Email', 'Status', 'Subscribed At', 'Confirmed At', 'Unsubscribed At', 'IP Address'];
    const rows = selectedSubscribers.map(sub => [
      sub.email,
      sub.status,
      formatDate(sub.subscribed_at),
      sub.confirmed_at ? formatDate(sub.confirmed_at) : 'Not confirmed',
      sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : 'N/A',
      sub.ip_address || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const today = new Date().toISOString().split('T')[0];
    link.download = `selected_subscribers_${today}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    setSuccess(`Downloaded ${selectedRows.length} selected subscribers`);
    setSelectedRows([]);
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => 
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Select all visible rows
  const handleSelectAll = () => {
    if (selectedRows.length === filteredSubscribers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredSubscribers.map(sub => sub.id));
    }
  };

  // Test API connection (for debugging)
  const testAPIConnection = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Testing API with token:', token ? 'Token exists' : 'No token');
      
      // Try to fetch subscribers
      const response = await axios.get('http://localhost:8000/subscribers/api/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      setSuccess('API connection successful!');
      setSubscribers(response.data);
    } catch (err) {
      console.error('API Test Error:', err);
      setError(`API Test Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
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
      'active': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'unsubscribed': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Filter subscribers based on search and status
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from filtered data
  const calculateStats = () => {
    const total = subscribers.length;
    const active = subscribers.filter(s => s.status === 'active').length;
    const pending = subscribers.filter(s => s.status === 'pending').length;
    const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed').length;
    const filtered = filteredSubscribers.length;
    
    return { total, active, pending, unsubscribed, filtered };
  };

  const localStats = calculateStats();

  // Load data on component mount
  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Newsletter Subscribers</h1>
              <p className="text-gray-600">
                Manage and export your newsletter subscriber list. Total subscribers: <span className="font-semibold">{localStats.total}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testAPIConnection}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Test API
              </button>
              
              <button
                onClick={fetchSubscribers}
                disabled={loading}
                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              <button
                onClick={downloadCSVSimple}
                disabled={downloading || loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {downloading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                Download All CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{localStats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{localStats.active}</p>
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
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{localStats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unsubscribed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{localStats.unsubscribed}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Box */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search subscribers by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Only</option>
                <option value="unsubscribed">Unsubscribed Only</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {selectedRows.length > 0 && (
                <button
                  onClick={downloadSelectedCSV}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Download Selected ({selectedRows.length})
                </button>
              )}
              
              <button
                onClick={downloadCSVFiltered}
                disabled={downloading}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Download Filtered
              </button>
            </div>
          </div>
          
          {/* Filter Info */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {localStats.filtered} of {localStats.total} subscribers
            {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
            {searchTerm && ` • Searching for: "${searchTerm}"`}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Subscribers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading subscribers...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No subscribers found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No subscribers have been added yet. Subscribe emails will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={filteredSubscribers.length > 0 && selectedRows.length === filteredSubscribers.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subscribed Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredSubscribers.map((subscriber) => (
                      <tr 
                        key={subscriber.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedRows.includes(subscriber.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(subscriber.id)}
                            onChange={() => handleRowSelect(subscriber.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 break-all">
                            {subscriber.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(subscriber.status)}`}>
                            {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(subscriber.subscribed_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {subscriber.ip_address || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedRows([subscriber.id]);
                              setTimeout(downloadSelectedCSV, 100);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 hover:bg-blue-50 rounded transition-colors"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      Showing <span className="font-semibold">{localStats.filtered}</span> of{' '}
                      <span className="font-semibold">{localStats.total}</span> subscribers
                      {selectedRows.length > 0 && (
                        <span className="ml-4">
                          • <span className="font-semibold text-blue-600">{selectedRows.length}</span> selected
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default SubscribersPage;
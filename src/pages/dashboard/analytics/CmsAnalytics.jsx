import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Visibility,
  Article,
  AccessTime,
  ThumbUp,
  CalendarToday,
  TrendingFlat,
  TrendingDown,
  Download,
  Search,
  Person,
  Star,
  Schedule,
  Refresh,
  Error as ErrorIcon,
  CloudOff as CloudOffIcon,
  CheckCircle,
} from '@mui/icons-material';

// API Configuration
const API_BASE_URL = 'https://cms-api.ontapke.com/blogs/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response) {
      return Promise.reject({
        message: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
        status: error.response.status
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: null
      });
    } else {
      return Promise.reject({
        message: error.message,
        status: null
      });
    }
  }
);

const CmsAnalytics = () => {
  // State management
  const [blogsData, setBlogsData] = useState(null); // Blogs list from /blogs/
  const [statsData, setStatsData] = useState(null); // Stats from /blogs/stats/
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to group blogs by month - MOVED ABOVE useMemo
  const groupBlogsByMonth = (blogs) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = {};
    
    blogs.forEach(blog => {
      const date = blog.published_at || blog.created_at;
      if (!date) return;
      
      try {
        const dateObj = new Date(date);
        const monthIndex = dateObj.getMonth();
        const monthName = months[monthIndex];
        const year = dateObj.getFullYear();
        const monthYearKey = `${monthName} ${year}`;
        
        if (!monthlyStats[monthYearKey]) {
          monthlyStats[monthYearKey] = {
            month: monthName,
            year: year,
            monthYear: monthYearKey,
            views: 0,
            blogCount: 0,
            avgReadTime: 0
          };
        }
        
        monthlyStats[monthYearKey].views += blog.view_count || 0;
        monthlyStats[monthYearKey].blogCount += 1;
        monthlyStats[monthYearKey].avgReadTime = 
          ((monthlyStats[monthYearKey].avgReadTime * (monthlyStats[monthYearKey].blogCount - 1)) + 
          (blog.reading_time || 0)) / monthlyStats[monthYearKey].blogCount;
      } catch (e) {
        console.error('Error parsing date:', date, e);
      }
    });
    
    // Convert to array and sort by date
    const result = Object.values(monthlyStats).sort((a, b) => {
      const monthA = months.indexOf(a.month);
      const monthB = months.indexOf(b.month);
      const yearA = a.year;
      const yearB = b.year;
      
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthA - monthB;
    });
    
    return result.length > 0 ? result.slice(-6) : [];
  };

  // Test connection
  const testConnection = async () => {
    try {
      const response = await api.get('blogs/', {
        params: {
          page_size: 1
        }
      });
      setIsConnected(true);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setIsConnected(false);
      return { success: false, error };
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching analytics data...');
      
      // Fetch blogs data
      const blogsResponse = await api.get('blogs/', {
        params: {
          page_size: 1000
        }
      });
      
      console.log('✅ Blogs data received:', {
        blogsCount: blogsResponse.blogs?.length,
        totalCount: blogsResponse.total_count,
        data: blogsResponse
      });
      
      setBlogsData(blogsResponse);
      
      // Fetch stats data
      try {
        const statsResponse = await api.get('blogs/stats/');
        console.log('✅ Stats data received:', statsResponse);
        setStatsData(statsResponse);
      } catch (statsError) {
        console.log('⚠️ No dedicated stats endpoint, will calculate from blogs data');
        setStatsData(null);
      }
      
      setIsConnected(true);
      
    } catch (err) {
      console.error('❌ Failed to fetch analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
      setIsConnected(false);
      setBlogsData(null);
      setStatsData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const connectionResult = await testConnection();
        
        if (connectionResult.success) {
          await fetchAllData();
        } else {
          setError(connectionResult.error?.message || 'Failed to connect to server');
        }
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err.message || 'Initialization failed');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Process and merge data from both sources
  const analytics = useMemo(() => {
    // Use stats data if available, otherwise calculate from blogs
    let stats = {
      total_blogs: 0,
      published_blogs: 0,
      draft_blogs: 0,
      scheduled_blogs: 0,
      total_views: 0,
      average_reading_time: 0,
      blogs_by_type: {},
      blogs_by_status: {},
      top_keywords: [],
      recent_posts: []
    };

    let blogs = [];
    let totalBlogsCount = 0;
    
    // Get blogs from blogsData
    if (blogsData?.blogs && blogsData.blogs.length > 0) {
      blogs = blogsData.blogs;
      totalBlogsCount = blogsData.total_count || blogs.length;
      
      // Calculate stats from blogs if no stats data
      if (!statsData) {
        stats.total_blogs = totalBlogsCount;
        stats.published_blogs = blogs.filter(blog => blog.status === 'published').length;
        stats.draft_blogs = blogs.filter(blog => blog.status === 'draft').length;
        stats.scheduled_blogs = blogs.filter(blog => blog.status === 'scheduled').length;
        stats.total_views = blogs.reduce((sum, blog) => sum + (blog.view_count || 0), 0);
        
        const totalReadingTime = blogs.reduce((sum, blog) => sum + (blog.reading_time || 0), 0);
        stats.average_reading_time = blogs.length > 0 ? (totalReadingTime / blogs.length).toFixed(1) : 0;
        
        // Blogs by type
        const typeCounts = {};
        blogs.forEach(blog => {
          const type = blog.blog_type || 'blog';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        stats.blogs_by_type = typeCounts;
        
        // Blogs by status
        const statusCounts = {};
        blogs.forEach(blog => {
          const status = blog.status || 'draft';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        stats.blogs_by_status = statusCounts;
        
        // Top keywords
        const keywordMap = {};
        blogs.forEach(blog => {
          const keyword = blog.primary_keyword;
          if (keyword && keyword.trim()) {
            if (!keywordMap[keyword]) {
              keywordMap[keyword] = {
                primary_keyword: keyword,
                count: 0,
                total_views: 0
              };
            }
            keywordMap[keyword].count += 1;
            keywordMap[keyword].total_views += blog.view_count || 0;
          }
        });
        stats.top_keywords = Object.values(keywordMap)
          .sort((a, b) => b.total_views - a.total_views)
          .slice(0, 5);
        
        // Recent posts
        stats.recent_posts = [...blogs]
          .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
          .slice(0, 5)
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
            published_at: blog.published_at,
            reading_time_minutes: blog.reading_time || 0
          }));
      }
    }
    
    // Use statsData if available
    if (statsData) {
      stats = { ...stats, ...statsData };
      totalBlogsCount = statsData.total_blogs || totalBlogsCount;
    }
    
    console.log('📊 Final analytics data:', { stats, blogsCount: blogs.length });
    
    // Process for display
    const overview = {
      totalViews: stats.total_views || 0,
      avgReadTime: parseFloat(stats.average_reading_time) || 0,
      totalBlogs: totalBlogsCount,
      publishedBlogs: stats.published_blogs || 0,
      draftBlogs: stats.draft_blogs || 0,
      scheduledBlogs: stats.scheduled_blogs || 0,
      archivedBlogs: stats.blogs_by_status?.archived || 0,
      featuredBlogs: blogs.filter(blog => blog.is_featured).length,
      avgViewsPerPost: totalBlogsCount > 0 ? Math.round((stats.total_views || 0) / totalBlogsCount) : 0,
      totalReadingTime: (parseFloat(stats.average_reading_time) || 0) * totalBlogsCount
    };
    
    // Blog type distribution
    const blogTypeDistribution = Object.entries(stats.blogs_by_type || {}).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      count,
      percentage: Math.round((count / totalBlogsCount) * 100)
    }));
    
    // Status distribution
    const statusDistribution = [
      { status: 'Published', count: stats.published_blogs || 0, color: '#10b981' },
      { status: 'Draft', count: stats.draft_blogs || 0, color: '#f59e0b' },
      { status: 'Scheduled', count: stats.scheduled_blogs || 0, color: '#3b82f6' },
      { status: 'Archived', count: stats.blogs_by_status?.archived || 0, color: '#6b7280' },
      { status: 'Featured', count: overview.featuredBlogs, color: '#8b5cf6' }
    ];
    
    // Top performing blogs
    const topPerforming = blogs
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
      .map(blog => ({
        id: blog.id,
        title: blog.title,
        views: blog.view_count || 0,
        readTime: blog.reading_time || 0,
        status: blog.status || 'draft',
        featured: blog.is_featured || false,
        publishedAt: blog.published_at,
        slug: blog.slug,
        author: blog.author_name || 'Unknown',
        excerpt: blog.excerpt || ''
      }));
    
    // Keyword performance
    const keywordPerformance = (stats.top_keywords || []).map(keyword => ({
      keyword: keyword.primary_keyword,
      totalViews: keyword.total_views || 0,
      blogCount: keyword.count || 0,
      avgViews: keyword.count > 0 ? Math.round(keyword.total_views / keyword.count) : 0
    }));
    
    // Monthly data - Now this works because groupBlogsByMonth is defined above
    const monthlyData = groupBlogsByMonth(blogs);
    
    // Recent blogs
    const recentBlogs = (stats.recent_posts || []).map(post => {
      const blog = blogs.find(b => b.id === post.id) || {};
      return {
        ...post,
        view_count: blog.view_count || 0,
        reading_time: post.reading_time_minutes
      };
    });
    
    // Authors
    const authorMap = {};
    blogs.forEach(blog => {
      const author = blog.author_name || 'Unknown';
      if (!authorMap[author]) {
        authorMap[author] = {
          author: author,
          blogCount: 0,
          totalViews: 0
        };
      }
      authorMap[author].blogCount += 1;
      authorMap[author].totalViews += blog.view_count || 0;
    });
    
    const authors = Object.values(authorMap)
      .sort((a, b) => b.blogCount - a.blogCount)
      .slice(0, 5);
    
    // Reading time distribution
    const readingTimeDistribution = [
      { range: '0-2 min', count: blogs.filter(b => (b.reading_time || 0) <= 2).length },
      { range: '2-5 min', count: blogs.filter(b => (b.reading_time || 0) > 2 && (b.reading_time || 0) <= 5).length },
      { range: '5-10 min', count: blogs.filter(b => (b.reading_time || 0) > 5 && (b.reading_time || 0) <= 10).length },
      { range: '10+ min', count: blogs.filter(b => (b.reading_time || 0) > 10).length }
    ];
    
    return {
      overview,
      blogTypeDistribution,
      statusDistribution,
      topPerforming,
      keywordPerformance,
      monthlyData,
      recentBlogs,
      authors,
      readingTimeDistribution,
      hasData: totalBlogsCount > 0
    };
  }, [blogsData, statsData]);

  // Connection Status Component
  const ConnectionStatus = () => {
    const blogsCount = blogsData?.blogs?.length || blogsData?.total_count || 0;
    const displayCount = statsData?.total_blogs || blogsCount;
    
    return (
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
                ? `Analyzing ${displayCount} blog post${displayCount !== 1 ? 's' : ''}` 
                : 'Unable to connect to the blog API. Make sure your Django server is running.'
              }
            </p>
            {isConnected && statsData && (
              <p className="text-xs text-emerald-500 mt-1">
                Using dedicated analytics endpoint for accurate statistics
              </p>
            )}
          </div>
          {!isConnected && (
            <button
              onClick={handleRefresh}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition-all duration-200"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  };

  // Loading Skeleton
  const AnalyticsSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="h-80 bg-gray-200 rounded-xl"></div>
        <div className="h-80 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="h-96 bg-gray-200 rounded-xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  // Stat Card Component
  const StatCard = ({ title, value, icon, subtitle, trend, change }) => (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
          {icon}
        </div>
      </div>
      {trend && change !== undefined && (
        <div className="flex items-center mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trend === 'up' 
              ? 'bg-emerald-100 text-emerald-800' 
              : trend === 'down' 
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
            {trend === 'flat' && <TrendingFlat className="w-3 h-3 mr-1" />}
            {change}%
          </span>
          <span className="ml-2 text-sm text-gray-500">Last 30 days</span>
        </div>
      )}
    </div>
  );

  // Top Performing Blog Card
  const TopBlogCard = ({ blog, rank }) => (
    <div className="flex items-center p-4 bg-white rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-semibold mr-4">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h4>
        <div className="flex items-center space-x-4 mt-2">
          <span className="inline-flex items-center text-xs text-gray-500">
            <Visibility className="w-3 h-3 mr-1" />
            {blog.views.toLocaleString()} views
          </span>
          <span className="inline-flex items-center text-xs text-gray-500">
            <Person className="w-3 h-3 mr-1" />
            {blog.author}
          </span>
        </div>
      </div>
      <div className="ml-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          blog.status === 'published' 
            ? 'bg-emerald-100 text-emerald-800' 
            : blog.status === 'scheduled'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
        }`}>
          {blog.status}
        </span>
        {blog.featured && (
          <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Featured
          </span>
        )}
      </div>
    </div>
  );

  // Keyword Card
  const KeywordCard = ({ keyword, rank }) => (
    <div className="flex items-center p-4 bg-white rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-semibold mr-4">
        {rank}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{keyword.keyword}</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500">Total Views</p>
            <p className="text-sm font-semibold text-emerald-600">{keyword.totalViews.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Views</p>
            <p className="text-sm font-semibold text-emerald-600">{keyword.avgViews}</p>
          </div>
        </div>
      </div>
      <div className="ml-4 text-right">
        <p className="text-lg font-bold text-emerald-600">{keyword.blogCount}</p>
        <p className="text-xs text-gray-500">Blogs</p>
      </div>
    </div>
  );

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, title, color = '#10b981', valueKey = 'count' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d[valueKey]));
    
    return (
      <div className="h-64">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-end space-x-2 h-48 px-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-3/4 rounded-t-lg transition-all duration-300 hover:opacity-90 relative group"
                style={{
                  height: `${(item[valueKey] / maxValue) * 100}%`,
                  backgroundColor: item.color || color,
                  minHeight: '10px'
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item[valueKey]} {valueKey === 'count' ? 'blogs' : 'views'}
                  {item.percentage && ` (${item.percentage}%)`}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 font-medium truncate w-full text-center">
                {item.type || item.status || item.range || item.author}
              </div>
              <div className="text-sm font-bold text-gray-900 mt-1">
                {item[valueKey]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Line Chart Component for Monthly Data
  const LineChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No monthly data available</p>
        </div>
      );
    }

    const maxViews = Math.max(...data.map(d => d.views));
    
    return (
      <div className="h-64">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="relative h-48">
          <div className="absolute bottom-0 left-0 right-0 flex items-end space-x-2 h-40 px-2">
            {data.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-3/4 rounded-t-lg transition-all duration-300 hover:opacity-90 bg-gradient-to-t from-emerald-500 to-emerald-300 relative group"
                  style={{
                    height: `${(month.views / maxViews) * 100}%`,
                    minHeight: '10px'
                  }}
                >
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="font-semibold">{month.views.toLocaleString()} views</div>
                    <div>{month.blogCount} blogs</div>
                    <div>Avg: {month.avgReadTime.toFixed(1)} min</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 font-medium">
                  {month.month}
                </div>
                <div className="text-xs text-gray-500">
                  {month.blogCount} blogs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
            Blog Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your blog performance
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center px-4 py-2.5 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50"
          >
            <Refresh className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <ErrorIcon className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">Error Loading Analytics</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <AnalyticsSkeleton />
      ) : blogsData?.blogs && blogsData.blogs.length > 0 ? (
        <>
          {/* Time Range Filter */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarToday className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Time Range</span>
              </div>
              <div className="flex space-x-2">
                {['7d', '30d', '3m', '6m', '1y', 'All'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Views"
              value={analytics.overview.totalViews.toLocaleString()}
              icon={<Visibility className="w-6 h-6 text-emerald-600" />}
              subtitle="Across all blogs"
            />
            <StatCard
              title="Average Read Time"
              value={`${analytics.overview.avgReadTime} min`}
              icon={<AccessTime className="w-6 h-6 text-blue-600" />}
              subtitle="Per article"
            />
            <StatCard
              title="Published Blogs"
              value={analytics.overview.publishedBlogs}
              icon={<Article className="w-6 h-6 text-purple-600" />}
              subtitle={`Total: ${analytics.overview.totalBlogs}`}
            />
            <StatCard
              title="Featured Blogs"
              value={analytics.overview.featuredBlogs}
              icon={<Star className="w-6 h-6 text-amber-600" />}
              subtitle={`${Math.round((analytics.overview.featuredBlogs / analytics.overview.totalBlogs) * 100)}% of total`}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg mr-3">
                  <CalendarToday className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Blogs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.draftBlogs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg mr-3">
                  <Schedule className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.scheduledBlogs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg mr-3">
                  <ThumbUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Views/Post</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgViewsPerPost}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Blog Type Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <SimpleBarChart 
                data={analytics.blogTypeDistribution} 
                title="Content Type Distribution"
              />
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <SimpleBarChart 
                data={analytics.statusDistribution} 
                title="Blog Status Distribution"
                color="#8b5cf6"
              />
            </div>
          </div>

          {/* Reading Time Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <SimpleBarChart 
              data={analytics.readingTimeDistribution} 
              title="Reading Time Distribution"
              color="#f59e0b"
            />
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <LineChart data={analytics.monthlyData} />
          </div>

          {/* Top Performing & Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Performing Blogs */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Blogs</h3>
                  <p className="text-sm text-gray-500">Most viewed content</p>
                </div>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {analytics.topPerforming.map((blog, index) => (
                  <TopBlogCard key={blog.id} blog={blog} rank={index + 1} />
                ))}
              </div>
            </div>

            {/* Keyword Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Keyword Performance</h3>
                  <p className="text-sm text-gray-500">Top performing keywords</p>
                </div>
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {analytics.keywordPerformance.map((keyword, index) => (
                  <KeywordCard key={keyword.keyword} keyword={keyword} rank={index + 1} />
                ))}
              </div>
              {analytics.keywordPerformance.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No keywords found in blogs</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Blogs & Authors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Blogs */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Blogs</h3>
                  <p className="text-sm text-gray-500">Latest published content</p>
                </div>
                <CalendarToday className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {analytics.recentBlogs.map((blog, index) => (
                  <div key={blog.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50/50 rounded-lg border border-emerald-100">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-semibold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {blog.published_at 
                              ? new Date(blog.published_at).toLocaleDateString() 
                              : 'Not published'}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {blog.reading_time || 0} min read
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{blog.view_count || 0}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authors */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Authors</h3>
                  <p className="text-sm text-gray-500">Most active contributors</p>
                </div>
                <Person className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {analytics.authors.map((author, index) => (
                  <div key={author.author} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-semibold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{author.author}</h4>
                        <p className="text-xs text-gray-500">{author.blogCount} blogs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{author.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">total views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Engagement Score</h4>
              <p className="text-3xl font-bold mb-2">
                {analytics.overview.totalBlogs > 0 
                  ? Math.min(Math.round(analytics.overview.avgViewsPerPost / 5), 10) 
                  : 0}/10
              </p>
              <p className="text-emerald-100">Based on average views per post</p>
              <TrendingUp className="w-8 h-8 mt-4 opacity-80" />
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Content Quality</h4>
              <p className="text-3xl font-bold mb-2">
                {analytics.overview.totalBlogs > 0 
                  ? Math.round((analytics.overview.publishedBlogs / analytics.overview.totalBlogs) * 10)
                  : 0}/10
              </p>
              <p className="text-blue-100">Based on published vs draft ratio</p>
              <Star className="w-8 h-8 mt-4 opacity-80" />
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Keyword Coverage</h4>
              <p className="text-3xl font-bold mb-2">
                {analytics.keywordPerformance.length}/5
              </p>
              <p className="text-purple-100">Top performing keywords identified</p>
              <Search className="w-8 h-8 mt-4 opacity-80" />
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 border-2 border-dashed border-emerald-300/50 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50">
          <div className="inline-flex p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
            <Article className="h-16 w-16 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">No Analytics Data Available</h3>
          <p className="mt-2 text-gray-500 mb-6 max-w-md mx-auto">
            {isConnected 
              ? 'Start creating blog posts to see analytics and performance metrics.'
              : 'Unable to connect to blog API. Please check your connection.'}
          </p>
          {isConnected && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500"
            >
              <Refresh className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CmsAnalytics;
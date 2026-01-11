import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Visibility,
  Article,
  AccessTime,
  Person,
  CalendarToday,
  TrendingFlat,
  TrendingDown,
  ThumbUp,
  Star,
  Share,
  Download,
  FilterList,
  PieChart,
  Language,
  Schedule,
  Label,
} from '@mui/icons-material';

const CmsAnalytics = ({ blogData, statsData, loading = false }) => {
  // Mock data - replace with actual API data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 12500,
      avgReadTime: 5.2,
      totalBlogs: 45,
      publishedBlogs: 32,
      draftBlogs: 8,
      scheduledBlogs: 5,
      avgViewsPerPost: 391,
      engagementRate: 2.3,
      bounceRate: 45,
      avgSessionDuration: '2:30',
      conversionRate: 1.2
    },
    timelineData: [
      { month: 'Jan', views: 1200, blogs: 4, avgReadTime: 4.8 },
      { month: 'Feb', views: 1800, blogs: 5, avgReadTime: 5.2 },
      { month: 'Mar', views: 2200, blogs: 6, avgReadTime: 5.5 },
      { month: 'Apr', views: 2500, blogs: 7, avgReadTime: 5.8 },
      { month: 'May', views: 3100, blogs: 8, avgReadTime: 6.1 },
      { month: 'Jun', views: 2800, blogs: 7, avgReadTime: 5.9 },
      { month: 'Jul', views: 3500, blogs: 8, avgReadTime: 6.3 }
    ],
    blogTypeData: [
      { name: 'Blog Posts', value: 28, color: '#10b981' },
      { name: 'White Papers', value: 8, color: '#0ea5e9' },
      { name: 'Case Studies', value: 9, color: '#8b5cf6' }
    ],
    statusData: [
      { name: 'Published', value: 32, color: '#10b981' },
      { name: 'Draft', value: 8, color: '#f59e0b' },
      { name: 'Scheduled', value: 5, color: '#3b82f6' }
    ],
    topPerforming: [
      { id: 1, title: 'Getting Started with React Hooks', views: 1250, readTime: 5, status: 'Published', trend: 'up', change: 12 },
      { id: 2, title: 'Modern Web Development Best Practices', views: 890, readTime: 8, status: 'Published', trend: 'up', change: 8 },
      { id: 3, title: 'E-commerce Performance Optimization', views: 540, readTime: 10, status: 'Draft', trend: 'down', change: 3 },
      { id: 4, title: 'AI in Modern Applications', views: 1200, readTime: 7, status: 'Published', trend: 'up', change: 15 },
      { id: 5, title: 'Cloud Architecture Patterns', views: 760, readTime: 9, status: 'Scheduled', trend: 'flat', change: 0 }
    ],
    keywordPerformance: [
      { keyword: 'react hooks', views: 4500, blogs: 8, avgPosition: 2.3 },
      { keyword: 'web development', views: 3200, blogs: 12, avgPosition: 3.1 },
      { keyword: 'performance optimization', views: 2800, blogs: 6, avgPosition: 4.2 },
      { keyword: 'best practices', views: 2100, blogs: 9, avgPosition: 5.7 },
      { keyword: 'case study', views: 1800, blogs: 4, avgPosition: 6.8 }
    ],
    trafficSources: [
      { source: 'Organic Search', percentage: 45, visitors: 5625 },
      { source: 'Direct', percentage: 25, visitors: 3125 },
      { source: 'Social Media', percentage: 15, visitors: 1875 },
      { source: 'Referral', percentage: 10, visitors: 1250 },
      { source: 'Email', percentage: 5, visitors: 625 }
    ],
    readingDistribution: [
      { range: '0-2 min', percentage: 15 },
      { range: '2-5 min', percentage: 35 },
      { range: '5-10 min', percentage: 30 },
      { range: '10+ min', percentage: 20 }
    ]
  });

  const [timeRange, setTimeRange] = useState('6m');
  const [isInitialized, setIsInitialized] = useState(false);
  const lineChartRef = useRef(null);
  const trafficChartRef = useRef(null);
  const readingChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const trafficChartInstance = useRef(null);
  const readingChartInstance = useRef(null);

  // Initialize charts - FIXED: Only initialize once and clean up properly
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    // Clean up previous charts
    const cleanUpCharts = () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
        lineChartInstance.current = null;
      }
      if (trafficChartInstance.current) {
        trafficChartInstance.current.destroy();
        trafficChartInstance.current = null;
      }
      if (readingChartInstance.current) {
        readingChartInstance.current.destroy();
        readingChartInstance.current = null;
      }
    };

    cleanUpCharts();

    // Initialize new charts
    if (lineChartRef.current && window.Chart) {
      const ctx = lineChartRef.current.getContext('2d');
      lineChartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.timelineData.map(d => d.month),
          datasets: [
            {
              label: 'Total Views',
              data: analytics.timelineData.map(d => d.views),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 3
            },
            {
              label: 'Blogs Published',
              data: analytics.timelineData.map(d => d.blogs * 100),
              borderColor: '#3b82f6',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Monthly Performance Trends'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                borderDash: [5, 5]
              },
              ticks: {
                callback: function(value, index, values) {
                  if (this.getLabelForValue(value).includes('Blogs')) {
                    return value / 100;
                  }
                  return value;
                }
              }
            }
          }
        }
      });
    }

    if (trafficChartRef.current && window.Chart) {
      const ctx = trafficChartRef.current.getContext('2d');
      trafficChartInstance.current = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: analytics.trafficSources.map(d => d.source),
          datasets: [{
            data: analytics.trafficSources.map(d => d.percentage),
            backgroundColor: [
              '#10b981',
              '#3b82f6',
              '#8b5cf6',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            }
          },
          cutout: '60%'
        }
      });
    }

    if (readingChartRef.current && window.Chart) {
      const ctx = readingChartRef.current.getContext('2d');
      readingChartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: analytics.readingDistribution.map(d => d.range),
          datasets: [{
            label: 'Reading Time Distribution',
            data: analytics.readingDistribution.map(d => d.percentage),
            backgroundColor: '#10b981',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#047857'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                borderDash: [5, 5]
              },
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          }
        }
      });
    }

    // Clean up on unmount
    return () => {
      cleanUpCharts();
    };
  }, [analytics, isInitialized]);

  // Stat Card Component
  const StatCard = ({ title, value, icon, change, trend, subtitle }) => (
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
      {change && (
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
          <span className="ml-2 text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );

  // Performance Card Component
  const PerformanceCard = ({ blog }) => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50/50 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h4>
        <div className="flex items-center space-x-4 mt-2">
          <span className="inline-flex items-center text-xs text-gray-500">
            <Visibility className="w-3 h-3 mr-1" />
            {blog.views.toLocaleString()} views
          </span>
          <span className="inline-flex items-center text-xs text-gray-500">
            <AccessTime className="w-3 h-3 mr-1" />
            {blog.readTime} min read
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          blog.status === 'Published' 
            ? 'bg-emerald-100 text-emerald-800' 
            : blog.status === 'Scheduled'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
        }`}>
          {blog.status}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          blog.trend === 'up' 
            ? 'bg-emerald-100 text-emerald-800' 
            : blog.trend === 'down'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {blog.change > 0 ? '+' : ''}{blog.change}%
        </span>
      </div>
    </div>
  );

  // Keyword Performance Card
  const KeywordCard = ({ keyword }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{keyword.keyword}</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500">Total Views</p>
            <p className="text-sm font-semibold text-emerald-600">{keyword.views.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Position</p>
            <p className="text-sm font-semibold text-emerald-600">{keyword.avgPosition}</p>
          </div>
        </div>
      </div>
      <div className="ml-4">
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">{keyword.blogs}</p>
          <p className="text-xs text-gray-500">Blogs</p>
        </div>
      </div>
    </div>
  );

  // Simple chart component using CSS
  const SimplePieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedAngle = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const x1 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((accumulatedAngle + angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((accumulatedAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            accumulatedAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="#fff"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="50" cy="50" r="20" fill="#fff" />
        </svg>
      </div>
    );
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, barColor = '#10b981' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="h-48 flex items-end space-x-2 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: barColor,
                minHeight: '10px'
              }}
            />
            <div className="mt-2 text-xs text-gray-600 font-medium truncate w-full text-center">
              {item.name}
            </div>
            <div className="text-sm font-bold text-gray-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-400 bg-clip-text text-transparent">
            Blog Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your blog performance</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <FilterList className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-teal-400 hover:from-emerald-800 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

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
          change={12}
          trend="up"
          subtitle="All time"
        />
        <StatCard
          title="Average Read Time"
          value={`${analytics.overview.avgReadTime} min`}
          icon={<AccessTime className="w-6 h-6 text-blue-600" />}
          change={8}
          trend="up"
          subtitle="Per article"
        />
        <StatCard
          title="Published Blogs"
          value={analytics.overview.publishedBlogs}
          icon={<Article className="w-6 h-6 text-purple-600" />}
          change={15}
          trend="up"
          subtitle={`Total: ${analytics.overview.totalBlogs}`}
        />
        <StatCard
          title="Engagement Rate"
          value={`${analytics.overview.engagementRate}%`}
          icon={<ThumbUp className="w-6 h-6 text-amber-600" />}
          change={3}
          trend="up"
          subtitle="Comments & Shares"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <p className="text-sm text-gray-500">Views and publishing activity over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-emerald-700">Views</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-blue-700">Blogs</span>
              </div>
            </div>
          </div>
          <div className="h-80 relative">
            <canvas ref={lineChartRef} className="w-full h-full" />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
              <p className="text-sm text-gray-500">Where your visitors come from</p>
            </div>
            <Language className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80 relative">
            <canvas ref={trafficChartRef} className="w-full h-full" />
          </div>
          <div className="mt-4 space-y-2">
            {analytics.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: [
                      '#10b981',
                      '#3b82f6',
                      '#8b5cf6',
                      '#f59e0b',
                      '#ef4444'
                    ][index] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{source.source}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{source.percentage}%</p>
                  <p className="text-xs text-gray-500">{source.visitors.toLocaleString()} visitors</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Reading Time Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reading Time Distribution</h3>
              <p className="text-sm text-gray-500">How long readers engage with content</p>
            </div>
            <AccessTime className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 relative">
            <canvas ref={readingChartRef} className="w-full h-full" />
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Type Distribution</h3>
              <p className="text-sm text-gray-500">Breakdown by blog type</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex flex-col items-center justify-center">
            <SimplePieChart data={analytics.blogTypeData} />
          </div>
          <div className="mt-4 space-y-2">
            {analytics.blogTypeData.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-sm font-medium text-gray-700">{type.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{type.value} posts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-500">Current content status</p>
            </div>
            <Schedule className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <SimpleBarChart data={analytics.statusData} />
          </div>
        </div>
      </div>

      {/* Top Performing & Keyword Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div key={blog.id} className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-semibold mr-4">
                  {index + 1}
                </span>
                <PerformanceCard blog={blog} />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
            View All Performance Reports →
          </button>
        </div>

        {/* Keyword Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Keyword Performance</h3>
              <p className="text-sm text-gray-500">Top performing keywords</p>
            </div>
            <Label className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.keywordPerformance.map((keyword, index) => (
              <div key={index} className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-semibold mr-4">
                  {index + 1}
                </span>
                <KeywordCard keyword={keyword} />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
            View All Keywords →
          </button>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Average Position</h4>
          <p className="text-3xl font-bold mb-2">3.4</p>
          <p className="text-emerald-100">Avg search ranking position</p>
          <TrendingUp className="w-8 h-8 mt-4 opacity-80" />
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Social Shares</h4>
          <p className="text-3xl font-bold mb-2">845</p>
          <p className="text-blue-100">Total shares across platforms</p>
          <Share className="w-8 h-8 mt-4 opacity-80" />
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Bounce Rate</h4>
          <p className="text-3xl font-bold mb-2">{analytics.overview.bounceRate}%</p>
          <p className="text-purple-100">Lower is better</p>
          <TrendingDown className="w-8 h-8 mt-4 opacity-80" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-lg font-semibold text-gray-900">Loading Analytics...</p>
              <p className="text-sm text-gray-600 mt-2">Crunching the numbers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CmsAnalytics;
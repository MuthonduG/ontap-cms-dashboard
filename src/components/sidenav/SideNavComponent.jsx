import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Article,
  Analytics,
  Email,
  Group,
  Logout,
  Settings,
  Help,
  Add,
  Edit,
  Visibility,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const SideNavComponent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState(false);
  const location = useLocation();

  // Navigation items - updated to use nested routes
  const navItems = [
    {
      id: 'crud-page',
      label: 'Blog Management',
      icon: <Article />,
      path: 'crud-page',
      hasDropdown: true,
      dropdownItems: [
        {
          id: 'view-blogs',
          label: 'View All Blogs',
          icon: <Visibility />,
          path: 'crud-page/view-blog'
        },
        {
          id: 'create-blog',
          label: 'Create New Blog',
          icon: <Add />,
          path: 'crud-page/create-blog'
        },
        {
          id: 'update-blog',
          label: 'Edit Blog',
          icon: <Edit />,
          path: 'crud-page/update-blog'
        }
      ]
    },
    {
      id: 'cms-analytics',
      label: 'Analytics',
      icon: <Analytics />,
      path: 'cms-analytics'
    },
    {
      id: 'news-letter',
      label: 'Newsletter',
      icon: <Email />,
      path: 'news-letter'
    },
    {
      id: 'subscribers-page',
      label: 'Subscribers',
      icon: <Group />,
      path: 'subscribers-page'
    }
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Check if we're on a blog management route and expand dropdown
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('/dashboard/crud-page')) {
      setExpandedDropdown(true);
    } else {
      setExpandedDropdown(false);
    }
  }, [location.pathname]);

  const toggleSideNav = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
      if (!isCollapsed) {
        setExpandedDropdown(false); // Collapse dropdown when sidebar collapses
      }
    }
  };

  const toggleDropdown = () => {
    setExpandedDropdown(!expandedDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Get the current active item from the location
  const getActiveItem = () => {
    const currentPath = location.pathname;
    
    if (currentPath.startsWith('/dashboard')) {
      const pathParts = currentPath.split('/');
      const dashboardPage = pathParts[2] || '';
      
      // Check if it's a dropdown item
      if (dashboardPage === 'crud-page' && pathParts[3]) {
        return pathParts[3]; // Return the specific dropdown item ID
      }
      
      return dashboardPage;
    }
    
    return 'crud-page';
  };

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name: user.name || user.username || 'User',
          initials: (user.name || user.username || 'U').charAt(0).toUpperCase(),
          role: user.is_staff ? 'Administrator' : 'Content Creator'
        };
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return {
      name: 'User',
      initials: 'U',
      role: 'Guest'
    };
  };

  const userInfo = getUserInfo();

  // Rest of your component...
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSideNav}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg lg:hidden"
        >
          <MenuIcon />
        </button>
      )}

      {/* Side Navigation */}
      <div className={`
        fixed left-0 top-0 h-screen z-40 bg-gradient-to-b from-white to-emerald-50 shadow-xl transition-all duration-300 ease-in-out flex flex-col
        ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        ${isCollapsed && !isMobile ? 'w-20' : 'w-64'}
      `}>
        {/* Logo Section */}
        <div className="p-4 border-b border-emerald-100">
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
            {(!isCollapsed || isMobile) ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">CMS</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ContentHub</h1>
                  <p className="text-xs text-gray-500">CMS Platform</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
            )}
            
            {/* Toggle Button */}
            <div className="flex items-center space-x-2">
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <ChevronLeft />
                </button>
              )}
              {!isMobile && (
                <button
                  onClick={toggleSideNav}
                  className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700 transition-colors duration-200"
                >
                  {isCollapsed ? <MenuIcon /> : <ChevronLeft />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile (Visible only when expanded or on mobile) */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-b border-emerald-100">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span className="text-white font-bold">{userInfo.initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</h3>
                <p className="text-xs text-gray-500 truncate">{userInfo.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = getActiveItem() === item.id || 
                (item.hasDropdown && item.dropdownItems?.some(dropItem => dropItem.id === getActiveItem()));
              
              if (item.hasDropdown) {
                return (
                  <div key={item.id} className="space-y-1">
                    {/* Dropdown Trigger */}
                    <button
                      onClick={toggleDropdown}
                      className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm ${
                        isActive 
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-l-4 border-emerald-500'
                          : 'text-gray-700 hover:border-l-4 hover:border-emerald-200'
                      }`}
                      title={isCollapsed && !isMobile ? item.label : ''}
                    >
                      <div className="flex items-center">
                        <span className={`text-gray-600 ${isActive ? 'text-emerald-600' : ''}`}>
                          {item.icon}
                        </span>
                        {(!isCollapsed || isMobile) && (
                          <span className="ml-3">{item.label}</span>
                        )}
                      </div>
                      {(!isCollapsed || isMobile) && (
                        <span className={`transition-transform duration-200 ${expandedDropdown ? 'rotate-180' : ''}`}>
                          <ExpandMore />
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown Content */}
                    {(!isCollapsed || isMobile) && expandedDropdown && (
                      <div className="ml-8 space-y-1 border-l border-emerald-200 pl-2">
                        {item.dropdownItems.map((dropdownItem) => {
                          const isDropdownActive = getActiveItem() === dropdownItem.id;
                          return (
                            <RouterLink
                              key={dropdownItem.id}
                              to={dropdownItem.path}
                              onClick={() => {
                                if (isMobile) {
                                  setIsMobileOpen(false);
                                }
                              }}
                              className={`flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                isDropdownActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span className={`mr-2 ${isDropdownActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {dropdownItem.icon}
                              </span>
                              <span>{dropdownItem.label}</span>
                            </RouterLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation item
              return (
                <RouterLink
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (isMobile) {
                      setIsMobileOpen(false);
                    }
                  }}
                  className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'} w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-l-4 border-emerald-500'
                      : 'text-gray-700 hover:border-l-4 hover:border-emerald-200'
                  }`}
                  title={isCollapsed && !isMobile ? item.label : ''}
                >
                  <span className={`text-gray-600 ${isActive ? 'text-emerald-600' : ''}`}>
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </RouterLink>
              );
            })}
          </nav>
        </div>

        {/* Additional Links (Visible only when expanded or on mobile) */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-emerald-100">
            <div className="space-y-1">
              <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5 text-gray-500" />
                <span className="ml-3">Settings</span>
              </button>
              <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <Help className="w-5 h-5 text-gray-500" />
                <span className="ml-3">Help & Support</span>
              </button>
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="p-4 border-t border-emerald-100">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'} w-full px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 rounded-lg font-medium hover:from-rose-100 hover:to-pink-100 transition-all duration-200 hover:shadow-sm`}
            title={isCollapsed && !isMobile ? 'Logout' : ''}
          >
            <Logout className="text-rose-600" />
            {(!isCollapsed || isMobile) && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Add custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </>
  );
};

export default SideNavComponent;
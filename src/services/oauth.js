// services/oauth.js

const BASE_URL = 'https://72c809a42220.ngrok-free.app/users/api/';

console.log('🔧 OAuth service initialized with BASE_URL:', BASE_URL);

// Token storage functions
const getToken = () => {
  const token = localStorage.getItem('access_token');
  console.log('🔑 Getting token from localStorage:', token ? 'Token exists' : 'No token');
  return token;
};

const setToken = (token) => {
  console.log('🔑 Setting access token in localStorage, length:', token.length);
  localStorage.setItem('access_token', token);
};

const removeToken = () => {
  console.log('🔑 Removing access token from localStorage');
  localStorage.removeItem('access_token');
};

const getRefreshToken = () => {
  const token = localStorage.getItem('refresh_token');
  console.log('🔑 Getting refresh token from localStorage:', token ? 'Token exists' : 'No token');
  return token;
};

const setRefreshToken = (token) => {
  console.log('🔑 Setting refresh token in localStorage, length:', token.length);
  localStorage.setItem('refresh_token', token);
};

const removeRefreshToken = () => {
  console.log('🔑 Removing refresh token from localStorage');
  localStorage.removeItem('refresh_token');
};

// Helper function for API calls (with FormData support)
const apiCall = async (endpoint, method = 'GET', data = null, requireAuth = false, isFormData = false) => {
  console.log(`🌐 apiCall: ${method} ${endpoint}`);
  console.log('🌐 Request data:', data);
  console.log('🌐 Require auth:', requireAuth);
  console.log('🌐 Is FormData:', isFormData);
  
  const headers = {};
  
  // Don't set Content-Type for FormData - browser will set it automatically
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = getToken();
    if (!token) {
      console.log('🔐 No authentication token found, throwing error');
      throw new Error('No authentication token found');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    if (isFormData) {
      config.body = data;
      console.log('🌐 Using FormData as body');
    } else {
      config.body = JSON.stringify(data);
      console.log('🌐 Using JSON as body:', config.body);
    }
  }

  console.log('🌐 Final request config:', {
    method: config.method,
    headers: config.headers,
    hasBody: !!config.body
  });

  try {
    console.log(`🌐 Making fetch request to: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    console.log('🌐 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.status === 401 && endpoint !== 'login/' && getRefreshToken()) {
      try {
        console.log('🔄 401 received, attempting token refresh');
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${getToken()}`;
          config.headers = headers;
          console.log('🔄 Token refreshed, retrying original request');
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, config);
          return await handleResponse(retryResponse);
        }
      } catch (refreshError) {
        console.error('🔄 Token refresh failed:', refreshError);
        logout();
        throw new Error('Session expired. Please login again.');
      }
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('🌐 API call error:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error - check CORS, URL, and internet connection');
    }
    throw error;
  }
};

const handleResponse = async (response) => {
  console.log('📄 Processing response...');
  const contentType = response.headers.get('content-type');
  console.log('📄 Content-Type:', contentType);
  
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
    console.log('📄 JSON response data:', data);
  } else {
    data = await response.text();
    console.log('📄 Text response data:', data);
  }

  console.log('📄 Response ok?', response.ok);
  console.log('📄 Response status:', response.status);

  if (!response.ok) {
    const error = new Error(data.error || data.message || data.detail || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    console.log('📄 Created error object:', {
      message: error.message,
      status: error.status,
      data: error.data
    });
    throw error;
  }

  console.log('📄 Response processed successfully');
  return data;
};

// File upload helper function
const uploadFile = async (endpoint, formData, requireAuth = false) => {
  console.log('📤 uploadFile called for endpoint:', endpoint);
  console.log('📤 FormData entries:');
  for (let pair of formData.entries()) {
    console.log('  ', pair[0], ':', pair[0] === 'avatar' ? `[File: ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes]` : pair[1]);
  }
  
  const headers = {};
  
  if (requireAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log('📤 Making fetch request to:', `${BASE_URL}${endpoint}`);
    console.log('📤 Headers:', headers);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.log('📤 Response status:', response.status);
    console.log('📤 Response status text:', response.statusText);
    console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('📤 Content-Type:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📤 JSON response data:', data);
    } else {
      data = await response.text();
      console.log('📤 Text response data:', data);
    }
    
    console.log('📤 Response OK?', response.ok);
    
    if (!response.ok) {
      const error = new Error(data.error || data.message || data.detail || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      console.log('📤 Error created:', error);
      throw error;
    }
    
    console.log('📤 Upload successful, returning data');
    return data;
  } catch (error) {
    console.error('📤 File upload error:', error);
    throw error;
  }
};

// Main auth service
export const authService = {
  // Login user
  async login(email, password) {
    console.log('🔐 authService.login called with email:', email);
    const data = await apiCall('login/', 'POST', { email, password });
    
    console.log('🔐 Login response:', data);
    
    if (data.access && data.refresh) {
      setToken(data.access);
      setRefreshToken(data.refresh);
      console.log('🔐 Tokens stored in localStorage');
      return data;
    }
    
    console.log('🔐 No tokens in response');
    throw new Error('Invalid response from server');
  },

  // Register new user (without file)
  async register(userData) {
    console.log('👤 authService.register called with:', userData);
    const data = await apiCall('register/', 'POST', userData);
    
    console.log('👤 Register response:', data);
    console.log('👤 Response has access token?', !!data.access);
    console.log('👤 Response has refresh token?', !!data.refresh);
    console.log('👤 Response has user?', !!data.user);
    
    if (data.access && data.refresh) {
      setToken(data.access);
      setRefreshToken(data.refresh);
      console.log('👤 Tokens stored in localStorage');
      return data;
    }
    
    console.log('👤 Returning data without storing tokens');
    return data;
  },

  // Register new user with avatar file
  async registerWithAvatar(userData, avatarFile = null) {
    console.log('👤📸 authService.registerWithAvatar called');
    console.log('👤📸 User data:', userData);
    console.log('👤📸 Avatar file:', avatarFile ? {
      name: avatarFile.name,
      type: avatarFile.type,
      size: avatarFile.size
    } : 'No file');
    
    // Create FormData object
    const formData = new FormData();
    
    // Add user data fields
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('first_name', userData.first_name);
    formData.append('last_name', userData.last_name);
    
    // Add avatar if exists
    if (avatarFile) {
      formData.append('avatar', avatarFile);
      console.log('👤📸 Avatar added to FormData');
    }
    
    console.log('👤📸 FormData entries:');
    for (let pair of formData.entries()) {
      console.log('  ', pair[0], ':', pair[0] === 'avatar' ? '[File object]' : pair[1]);
    }
    
    // Use the uploadFile helper for FormData
    const data = await uploadFile('register/', formData);
    
    console.log('👤📸 RegisterWithAvatar response:', data);
    console.log('👤📸 Response has access token?', !!data.access);
    console.log('👤📸 Response has refresh token?', !!data.refresh);
    
    if (data.access && data.refresh) {
      setToken(data.access);
      setRefreshToken(data.refresh);
      console.log('👤📸 Tokens stored in localStorage');
      return data;
    }
    
    console.log('👤📸 Returning data without storing tokens');
    return data;
  },

  // Alternative method that handles both cases
  async registerUser(userData, avatarFile = null) {
    console.log('👤🔄 registerUser called, avatarFile:', !!avatarFile);
    if (avatarFile) {
      return await this.registerWithAvatar(userData, avatarFile);
    } else {
      return await this.register(userData);
    }
  },

  // Get current user profile
  async getCurrentUser() {
    console.log('👤 Getting current user');
    const token = getToken();
    if (!token) {
      console.log('👤 No token found');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 Decoded token payload:', payload);
      return await this.getUser(payload.user_id);
    } catch (error) {
      console.error('👤 Error decoding token:', error);
      return null;
    }
  },

  // Get all users (requires authentication)
  async getUsers() {
    console.log('👥 Getting all users');
    return await apiCall('get_users/', 'GET', null, true);
  },

  // Get specific user by ID (requires authentication)
  async getUser(userId) {
    console.log('👤 Getting user with ID:', userId);
    return await apiCall(`get_user/${userId}/`, 'GET', null, true);
  },

  // Logout user
  logout() {
    console.log('🚪 Logging out user');
    removeToken();
    removeRefreshToken();
  },

  // Check if user is authenticated
  isAuthenticated() {
    const hasToken = !!getToken();
    console.log('🔐 User authenticated?', hasToken);
    return hasToken;
  },

  // Get authentication headers for manual fetch calls
  getAuthHeaders() {
    const token = getToken();
    if (!token) {
      console.log('🔐 No token for auth headers');
      return {};
    }
    
    console.log('🔐 Auth headers created');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
};

// Token refresh function
async function refreshAccessToken() {
  console.log('🔄 Refreshing access token');
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('🔄 No refresh token available');
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${BASE_URL}token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.log('🔄 Token refresh failed with status:', response.status);
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    if (data.access) {
      setToken(data.access);
      console.log('🔄 Token refreshed successfully');
      return true;
    }
    
    console.log('🔄 No access token in refresh response');
    return false;
  } catch (error) {
    console.error('🔄 Refresh token error:', error);
    removeToken();
    removeRefreshToken();
    throw error;
  }
}

function logout() {
  console.log('🚪 Logout function called');
  removeToken();
  removeRefreshToken();
}

// Interceptor setup for axios (if you're using axios)
export const setupAxiosInterceptors = (axiosInstance) => {
  console.log('🔧 Setting up axios interceptors');
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('🔧 Axios request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.error('🔧 Axios response interceptor error:', error);
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry && getRefreshToken()) {
        originalRequest._retry = true;
        
        try {
          await refreshAccessToken();
          const token = getToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// User service functions
export const userService = {
  async createUser(userData) {
    console.log('👤 userService.createUser called');
    return await authService.register(userData);
  },

  async updateUser(userId, userData) {
    console.log('👤 userService.updateUser called for user:', userId);
    return await apiCall(`update_user/${userId}/`, 'PUT', userData, true);
  },

  async deleteUser(userId) {
    console.log('👤 userService.deleteUser called for user:', userId);
    return await apiCall(`delete_user/${userId}/`, 'DELETE', null, true);
  },

  // Update user with avatar
  async updateUserWithAvatar(userId, userData, avatarFile = null) {
    console.log('👤📸 userService.updateUserWithAvatar called');
    if (avatarFile) {
      const formData = new FormData();
      
      // Add user data fields
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      formData.append('avatar', avatarFile);
      
      return await uploadFile(`update_user/${userId}/`, formData, true);
    } else {
      return await apiCall(`update_user/${userId}/`, 'PUT', userData, true);
    }
  }
};

// Export all functions
export default {
  ...authService,
  ...userService,
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  BASE_URL,
};
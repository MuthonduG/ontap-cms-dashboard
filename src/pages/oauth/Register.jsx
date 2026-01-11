import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import {
  Mail as MailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { authService } from '../../services/oauth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    avatar: null
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(5);

  // Timer effect for auto-redirect
  useEffect(() => {
    if (registrationSuccess && redirectTimer > 0) {
      const timer = setTimeout(() => {
        setRedirectTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (registrationSuccess && redirectTimer === 0) {
      handleAutoRedirect();
    }
  }, [registrationSuccess, redirectTimer]);

  const handleAutoRedirect = () => {
    console.log('🔄 Auto-redirecting to home page');
    navigate('/');
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setIsSubmitting(true);
    console.log('🚀 =========== REGISTRATION STARTED ===========');

    try {
      // Prepare user data
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      console.log('📝 Form data prepared:', userData);
      console.log('📸 Avatar file exists:', !!formData.avatar);
      if (formData.avatar) {
        console.log('📸 Avatar details:', {
          name: formData.avatar.name,
          type: formData.avatar.type,
          size: formData.avatar.size
        });
      }

      // Show loading toast
      const loadingToast = toast.info('Creating your account...', {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      // Call the registration service
      let response;
      if (formData.avatar) {
        console.log('🔄 Calling authService.registerWithAvatar...');
        response = await authService.registerWithAvatar(userData, formData.avatar);
      } else {
        console.log('🔄 Calling authService.register...');
        response = await authService.register(userData);
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      console.log('✅ =========== REGISTRATION RESPONSE ===========');
      console.log('✅ Full response object:', response);
      console.log('✅ Response type:', typeof response);
      
      if (response) {
        console.log('✅ Response has data:', !!response);
        console.log('✅ Response keys:', Object.keys(response));
        console.log('✅ Response values:', Object.values(response));
        
        // Log specific fields we expect
        console.log('✅ Has access token?', !!response.access);
        console.log('✅ Has refresh token?', !!response.refresh);
        console.log('✅ Has user data?', !!response.user);
        console.log('✅ Response status:', response.status);
        
        if (response.access) {
          console.log('✅ Access token length:', response.access.length);
        }
        
        if (response.user) {
          console.log('✅ User data:', response.user);
        }
        
        setRegisteredEmail(formData.email);
        
        // Show success toast
        toast.success('🎉 Account created successfully! Welcome to Ontap CMS!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        console.log('🏁 Setting registration success to true');
        
        // Set success state and start redirect timer
        setRegistrationSuccess(true);
        setRedirectTimer(5);
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: '',
          avatar: null
        });
        setAvatarPreview(null);
        
        console.log('✅ =========== REGISTRATION COMPLETE ===========');
      } else {
        console.log('❌ No response received from registration');
        console.log('❌ Response is:', response);
        
        toast.error('Registration completed but no response received from server', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('❌ =========== REGISTRATION ERROR ===========');
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.status);
      console.error('❌ Error data:', error.data);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Full error object:', error);
      
      // Handle specific error cases
      let errorMessage = 'Registration failed. Please try again.';
      let showToast = true;
      
      if (error.status === 409) {
        errorMessage = 'Email already exists. Please use a different email.';
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (error.status === 400) {
        // Handle validation errors from backend
        console.log('🔍 Processing 400 error data:', error.data);
        
        if (error.data && error.data.email) {
          errorMessage = Array.isArray(error.data.email) ? error.data.email[0] : error.data.email;
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (error.data && error.data.error) {
          errorMessage = error.data.error;
        } else if (error.data && typeof error.data === 'object') {
          // Get first error message
          const errors = Object.values(error.data);
          if (errors.length > 0) {
            const firstError = errors[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        } else if (error.data && typeof error.data === 'string') {
          errorMessage = error.data;
        }
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (showToast) {
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      
      console.error('❌ =========== ERROR PROCESSING COMPLETE ===========');
    } finally {
      setIsSubmitting(false);
      console.log('🔚 =========== REGISTRATION FLOW ENDED ===========');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)', {
          position: "top-right",
          autoClose: 3000,
        });
        setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB', {
          position: "top-right",
          autoClose: 3000,
        });
        setErrors(prev => ({ ...prev, avatar: 'Image size should be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      setErrors(prev => ({ ...prev, avatar: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      toast.success('✅ Profile picture selected successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    setErrors(prev => ({ ...prev, avatar: '' }));
    toast.info('Profile picture removed', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleLoginRedirect = () => {
    console.log('🔗 Redirecting to login page');
    navigate('/login');
  };

  const handleHomeRedirect = () => {
    console.log('🔗 Redirecting to home page');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Debug function to test the service
  const testRegistrationService = async () => {
    console.log('🧪 =========== TESTING REGISTRATION SERVICE ===========');
    
    const testData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test1234',
      first_name: 'Test',
      last_name: 'User',
    };

    try {
      console.log('🧪 Test data:', testData);
      
      // Test regular registration
      console.log('🧪 Testing authService.register...');
      const result = await authService.register(testData);
      console.log('🧪 Register result:', result);
      
      if (result && result.access) {
        console.log('🧪 ✅ Regular registration works!');
      } else {
        console.log('🧪 ❌ Regular registration failed or missing tokens');
      }
      
    } catch (error) {
      console.error('🧪 Test error:', error);
    }
    
    console.log('🧪 =========== TEST COMPLETE ===========');
  };

  // Success Screen Component
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <ToastContainer />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center animate-bounce">
                <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Account Created Successfully!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Welcome to Ontap CMS! You can now access all features.
              </p>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-3">
                  <EmailIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-gray-700">
                    Welcome email sent to <span className="font-semibold">{registeredEmail}</span>
                  </p>
                </div>
              </div>

              {/* Auto-redirect countdown */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  Redirecting to home page in <span className="font-bold text-emerald-600">{redirectTimer}</span> seconds...
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(5 - redirectTimer) * 20}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleHomeRedirect}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Go to Home Page Now
                </button>
                
                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Continue to Login
                </button>
                
                <button
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setRegisteredEmail('');
                    setRedirectTimer(5);
                  }}
                  className="w-full py-3 px-4 text-gray-600 font-medium rounded-xl hover:text-gray-800 transition-all duration-200"
                >
                  Create Another Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <ToastContainer />
      
      {/* Debug button (temporary) */}
      <button
        onClick={testRegistrationService}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        style={{ display: 'none' }} // Hidden by default, change to 'block' to show
      >
        Test Service
      </button>
      
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Left Side - Branding */}
          <div className="md:w-2/5 bg-gradient-to-br from-emerald-700 to-teal-400 p-8 md:p-12 text-white hidden md:block">
            <div className="h-full flex flex-col justify-between">
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center text-emerald-100 hover:text-white mb-8 transition-colors duration-200 hover:transform hover:-translate-x-1"
                >
                  <ArrowBackIcon className="w-5 h-5 mr-2" />
                  Back
                </button>
                
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Join Ontap CMS</h1>
                  <p className="text-emerald-100 opacity-90">Create your account and start building amazing content</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">SEO Analytics</h3>
                    <p className="text-sm text-emerald-100 opacity-80">Advanced SEO tools for better rankings</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <PersonIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Content Management</h3>
                    <p className="text-sm text-emerald-100 opacity-80">Easily create and manage your content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-3/5 p-8 md:p-12">
            {/* Mobile Back Button */}
            <button
              onClick={handleBack}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
            >
              <ArrowBackIcon className="w-5 h-5 mr-2" />
              Back
            </button>

            {/* Mobile Header */}
            <div className="mb-8 md:hidden">
              <h1 className="text-2xl font-bold text-gray-900">Create Ontap CMS Account</h1>
              <p className="text-gray-600 mt-2">Start building amazing content today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <PersonIcon className={`w-5 h-5 ${errors.first_name ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border ${errors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="John"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ErrorIcon className="w-4 h-4 mr-1" />
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <PersonIcon className={`w-5 h-5 ${errors.last_name ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border ${errors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ErrorIcon className="w-4 h-4 mr-1" />
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MailIcon className={`w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockIcon className={`w-5 h-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <VisibilityOffIcon className="w-5 h-5" /> : <VisibilityIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ErrorIcon className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockIcon className={`w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon className="w-5 h-5" /> : <VisibilityIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ErrorIcon className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Profile Picture (Optional)
                </label>
                
                <div className="space-y-4">
                  {/* Preview */}
                  {avatarPreview && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-md"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {formData.avatar?.name || 'Selected image'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.avatar?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className={`border-2 ${errors.avatar ? 'border-red-300' : 'border-dashed border-gray-300'} rounded-xl p-6 transition-all duration-200 hover:border-emerald-400 hover:shadow-sm`}>
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-3">
                        <UploadIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload photo
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                  </div>
                  
                  {errors.avatar && (
                    <p className="text-sm text-red-600 flex items-center">
                      <ErrorIcon className="w-4 h-4 mr-1" />
                      {errors.avatar}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-emerald-600 hover:text-emerald-800 font-medium underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-emerald-600 hover:text-emerald-800 font-medium underline">
                    Privacy Policy
                  </a>
                  <span className="text-rose-500 ml-1">*</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={handleLoginRedirect}
                    className="text-emerald-600 hover:text-emerald-800 font-semibold underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
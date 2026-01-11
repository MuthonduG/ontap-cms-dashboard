import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import {
  Mail as MailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { authService } from '../../services/oauth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validateLoginForm = () => {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    if (!resetEmail) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
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

    try {
      console.log('🔐 Attempting login with email:', formData.email);

      // Use authService for login
      const response = await authService.login(formData.email, formData.password);
      
      console.log('✅ Login successful, response:', response);

      // Show success toast
      toast.success('🎉 Welcome back! Login successful!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Store user info based on remember me choice
      if (response.user) {
        const userData = {
          email: formData.email,
          ...response.user
        };
        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 400) {
        if (error.data && error.data.detail) {
          errorMessage = error.data.detail;
        } else if (error.data && error.data.non_field_errors) {
          errorMessage = error.data.non_field_errors[0];
        }
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Update form errors
      if (error.status === 401 || error.status === 400) {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) {
      toast.error('Please enter a valid email address.', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📧 Attempting password reset for:', resetEmail);

      // Simulate password reset request
      const response = await fetch('/api/auth/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        setResetSent(true);
        setErrors({});
        
        toast.success('📧 Password reset instructions sent to your email!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        const errorMessage = 'Email not found. Please try again.';
        setErrors({ email: errorMessage });
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      const errorMessage = 'Failed to send reset email. Please try again.';
      setErrors({ email: errorMessage });
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
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
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleResetChange = (e) => {
    setResetEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSignupRedirect = () => {
    navigate('/register');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Password Reset Success Screen
  if (resetSent) {
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
                Check Your Email
              </h2>
              
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to:
              </p>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <p className="font-semibold text-gray-800">{resetEmail}</p>
              </div>
              
              <p className="text-sm text-gray-500 mb-8">
                If you don't see the email, check your spam folder or try again.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Return to Login
                </button>
                
                <button
                  onClick={() => {
                    setResetSent(false);
                    setErrors({});
                  }}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Send Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <ToastContainer />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Back Button */}
            <button
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
            >
              <ArrowBackIcon className="w-5 h-5 mr-2" />
              Back to Login
            </button>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-gray-600 mt-2">
                Enter your email and we'll send you reset instructions
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MailIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={handleResetChange}
                    className={`w-full pl-12 pr-4 py-3 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Login Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <ToastContainer />
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
                  <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                  <p className="text-emerald-100 opacity-90">Sign in to continue your journey with us</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <LockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Login</h3>
                    <p className="text-sm text-emerald-100 opacity-80">Your data is protected with encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <PersonIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal Dashboard</h3>
                    <p className="text-sm text-emerald-100 opacity-80">Access your personalized workspace</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
              <p className="text-gray-600 mt-2">Welcome back! Please sign in to continue</p>
            </div>

            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
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
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
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
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="remember-me" className="text-sm text-gray-700">
                  Remember me for 30 days
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
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LoginIcon className="w-5 h-5 mr-2" />
                    Sign In
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login (Optional) */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="#000000" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Signup Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleSignupRedirect}
                    className="text-emerald-600 hover:text-emerald-800 font-semibold underline"
                  >
                    Create account
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

export default Login;
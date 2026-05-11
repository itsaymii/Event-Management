// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Helper function to format API errors (handles both string and array)
const formatApiError = (errorValue) => {
  if (!errorValue) return '';
  if (Array.isArray(errorValue)) {
    return errorValue.join(', ');
  }
  if (typeof errorValue === 'string') {
    return errorValue;
  }
  if (typeof errorValue === 'object') {
    return Object.values(errorValue)
      .map(v => formatApiError(v))
      .filter(v => v)
      .join('; ');
  }
  return String(errorValue);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  const API_BASE = 'http://127.0.0.1:8002/api';

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      // Parse and ensure organization_role is uppercase
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.organization_role) {
        parsedUser.organization_role = parsedUser.organization_role.toUpperCase();
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  // Login function - FIXED with uppercase role & debug logs
  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      // Build payload - send both email & username to avoid mismatch
      const payload = {
        password: password.trim(),
        email: identifier.includes('@') ? identifier.trim() : identifier.trim(), // backend can accept either
        username: identifier.includes('@') ? identifier.trim().split('@')[0] : identifier.trim(),
      };

      const res = await axios.post(`${API_BASE}/auth/login/`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      // Extract tokens and user data from JWT response
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken || '');
      setToken(accessToken);
      
      // FIXED: Force organization_role to uppercase for consistent comparison
      const userInfo = { 
        id: res.data.user_id || res.data.id,
        username: res.data.username || identifier,
        email: res.data.email || identifier,
        organization_role: (res.data.organization_role || 'User').toUpperCase(), // ✅ FORCE UPPERCASE
        is_staff: res.data.is_staff || false,
        is_superuser: res.data.is_superuser || false,
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        full_name: res.data.full_name || `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim() || identifier,
      };

      // Debug log (pansamantala - pwede mong tanggalin pag working na)
      console.log('Login Success → User Info:', userInfo);
      console.log('Login Success → Role (uppercase):', userInfo.organization_role);

      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      return { success: true };

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response?.status === 400 || err.response?.status === 401) {
        const errors = err.response?.data;
        if (errors) {
          if (errors.username) errorMsg = formatApiError(errors.username);
          else if (errors.email) errorMsg = formatApiError(errors.email);
          else if (errors.password) errorMsg = formatApiError(errors.password);
          else if (errors.non_field_errors) errorMsg = formatApiError(errors.non_field_errors);
          else if (errors.detail) errorMsg = formatApiError(errors.detail);
          else {
            errorMsg = Object.entries(errors)
              .map(([field, value]) => `${field}: ${formatApiError(value)}`)
              .join('; ');
          }
        }
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Is Django running at http://127.0.0.1:8000?';
      }

      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - FIXED with organization_role handling
  const register = async (fullName, email, password, confirmPassword, organizationRole) => {
    setIsLoading(true);
    try {
      // Basic validation (client-side)
      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      const payload = {
        username: email.split('@')[0],
        email: email,
        password: password,
        confirm_password: confirmPassword,
        first_name: fullName.split(' ')[0] || '',
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        organization_role: (organizationRole || 'User').toUpperCase(), // Send uppercase to backend
      };

      const res = await axios.post(`${API_BASE}/auth/register/`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      // Return role in uppercase for consistency
      return { 
        success: true, 
        message: res.data.message || 'Account created successfully! Please login with your credentials.',
        organization_role: (res.data.organization_role || organizationRole || 'User').toUpperCase(),
      };

    } catch (err) {
      console.error('=== REGISTER ERROR DEBUG ===');
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('============================');
      
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.status === 400) {
        const errors = err.response.data;
        
        if (errors) {
          if (errors.email) errorMsg = formatApiError(errors.email);
          else if (errors.username) errorMsg = formatApiError(errors.username);
          else if (errors.password) errorMsg = formatApiError(errors.password);
          else if (errors.confirm_password) errorMsg = formatApiError(errors.confirm_password);
          else if (errors.non_field_errors) errorMsg = formatApiError(errors.non_field_errors);
          else if (errors.first_name) errorMsg = formatApiError(errors.first_name);
          else if (errors.last_name) errorMsg = formatApiError(errors.last_name);
          else if (errors.organization_role) errorMsg = formatApiError(errors.organization_role);
          else {
            errorMsg = Object.entries(errors)
              .map(([field, value]) => `${field}: ${formatApiError(value)}`)
              .join('; ');
          }
        }
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Is Django running at http://127.0.0.1:8000?';
      }

      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// src/context/AuthContext.jsx - FINAL FIXED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ✅ Helper: Format API errors (handles string, array, or object)
const formatApiError = (errorValue) => {
  if (!errorValue) return '';
  if (Array.isArray(errorValue)) return errorValue.filter(Boolean).join(', ');
  if (typeof errorValue === 'string') return errorValue;
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

  // ✅ Simplified, robust API_BASE
  const API_BASE = useCallback(() => {
    const env = import.meta.env.VITE_API_URL?.trim();
    if (env) return env.endsWith('/api') ? env : `${env.replace(/\/+$/, '')}/api`;
    const origin = window.location.origin;
    return origin.endsWith('/api') ? origin : `${origin.replace(/\/+$/, '')}/api`;
  }, []);

  const apiBase = API_BASE();
  
  // 🔍 DEBUG: Log API URL at startup
  useEffect(() => {
    console.log('🌐 API Base URL:', apiBase);
    console.log('📦 VITE_API_URL env:', import.meta.env.VITE_API_URL);
  }, [apiBase]);

  // ✅ Load auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.organization_role) {
            parsedUser.organization_role = parsedUser.organization_role.toUpperCase();
          }
          setToken(storedToken);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse stored auth:', e);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // ✅ FIXED LOGIN - handles array/string errors, email/username login
  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const payload = identifier.includes('@')
        ? { email: identifier.trim().toLowerCase(), password: password.trim() }
        : { username: identifier.trim(), password: password.trim() };

      console.log('📤 Sending login payload:', JSON.stringify(payload));
      
      const res = await axios.post(`${apiBase}/auth/login/`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('✅ Login successful, response:', res.data);
      
      const { access, refresh, ...userData } = res.data;
      if (!access) throw new Error('No access token received');

      // ✅ Normalize user data
      const userInfo = {
        id: userData.user_id || userData.id,
        username: userData.username || identifier,
        email: userData.email || identifier,
        organization_role: (userData.organization_role || 'User').toUpperCase(),
        is_staff: !!userData.is_staff,
        is_superuser: !!userData.is_superuser,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        full_name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || identifier,
      };

      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setToken(access);
      setUser(userInfo);
      
      return { success: true };

    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Full error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error details (expanded):', JSON.stringify(err.response?.data, null, 2));
      
      let errorMsg = 'Login failed. Please check your credentials.';
      
      if (err.response?.data) {
        const data = err.response.data;
        // ✅ Handle both array and string error formats
        if (Array.isArray(data.detail)) {
          errorMsg = data.detail.join(', ');
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (data.username) {
          errorMsg = formatApiError(data.username);
        } else if (data.email) {
          errorMsg = formatApiError(data.email);
        } else if (data.password) {
          errorMsg = formatApiError(data.password);
        } else if (data.non_field_errors) {
          errorMsg = formatApiError(data.non_field_errors);
        } else {
          errorMsg = Object.entries(data)
            .map(([k, v]) => `${k}: ${formatApiError(v)}`)
            .join('; ') || errorMsg;
        }
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMsg = 'Cannot connect to server. Please check your internet connection.';
      }

      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED REGISTER
  const register = async (fullName, email, password, confirmPassword, organizationRole) => {
    setIsLoading(true);
    try {
      if (password !== confirmPassword) return { success: false, error: 'Passwords do not match' };
      if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters' };
      if (!email.includes('@')) return { success: false, error: 'Please enter a valid email' };

      const payload = {
        username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || `user_${Date.now()}`,
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
        first_name: fullName.trim().split(' ')[0] || '',
        last_name: fullName.trim().split(' ').slice(1).join(' ') || '',
        organization_role: organizationRole || 'User',  // Use exact case from model: 'User', 'OSAS', 'Property'
      };

      console.log('📤 Sending registration payload:', JSON.stringify(payload, null, 2));

      const res = await axios.post(`${apiBase}/auth/register/`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('✅ Registration successful, response:', res.data);

      return { success: true, message: 'Account created! Please login.', organization_role: organizationRole || 'User' };

    } catch (err) {
      console.error('❌ Register error:', err);
      console.error('❌ Full error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error details (expanded):', JSON.stringify(err.response?.data, null, 2));
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.detail)) {
          errorMsg = data.detail.join(', ');
        } else if (data.email) errorMsg = formatApiError(data.email);
        else if (data.username) errorMsg = formatApiError(data.username);
        else if (data.password) errorMsg = formatApiError(data.password);
        else if (data.non_field_errors) errorMsg = formatApiError(data.non_field_errors);
        else errorMsg = Object.entries(data).map(([k,v]) => `${k}: ${formatApiError(v)}`).join('; ') || errorMsg;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMsg = 'Cannot connect to server.';
      }
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    try {
      const res = await axios.post(`${apiBase}/auth/token/refresh/`, { refresh }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        setToken(res.data.access);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
      logout();
    }
    return false;
  };

  const value = {
    user, token, isLoading, login, register, logout, refreshToken,
    isAuthenticated: !!token,
    apiBase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
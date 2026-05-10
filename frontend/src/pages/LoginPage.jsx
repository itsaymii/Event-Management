import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronLeft, AlertCircle, UserPlus } from 'lucide-react';
import Logo from '../images/Logo.png';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onBack, onSignUp }) => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // ✅ Validate both fields first
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(identifier, password);
    
    if (result.success) {
      // ✅ Get the saved user object immediately from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const role = storedUser?.organization_role?.toUpperCase();

      // ✅ Debug log (pansamantala - pwedeng tanggalin pag working na)
      console.log('🧭 Redirecting based on role:', role);
      console.log('🧭 Full stored user:', storedUser);

      // ✅ Route based on uppercase role comparison
      if (role === 'OSAS') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');

      // Shake animation for error feedback
      const form = e.target.closest('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-all text-sm font-semibold group z-20"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>
      )}

      {/* Login Card */}
      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/60 rounded-3xl p-8 md:p-12">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <img src={Logo} alt="OSAS Logo" className="w-20 h-20 object-contain relative transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Event Management System</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username/Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Username or Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: null }));
                  }}
                  placeholder="Enter your username"
                  className={`w-full bg-slate-50/50 border rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                    fieldErrors.identifier ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-xs text-red-500 ml-1">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                <button type="button" className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-widest">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50/50 border rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                    fieldErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-slate-900 hover:bg-cyan-600 disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 overflow-hidden relative"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Sign Up Section */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or</span>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              onClick={onSignUp}
              disabled={authLoading}
              className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
              <span>Create New Account</span>
              <ChevronLeft size={16} className="rotate-180 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center mt-4 text-xs text-slate-400">
              Join OSAS to manage your events seamlessly
            </p>
          </div>
        </div>

        {/* Legal */}
        <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          © 2026 OSAS System • Privacy Policy • Terms of Service
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
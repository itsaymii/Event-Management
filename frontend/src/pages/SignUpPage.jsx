import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ChevronDown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Logo from '../images/Logo.png';
import { useAuth } from '../context/AuthContext'; 

const SignUpPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    organizationRole: 'User',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Memoized password strength for performance
  const strength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { level: 0, text: 'REQUIRED', color: 'bg-slate-200', textCol: 'text-slate-400' };
    if (pass.length < 6) return { level: 1, text: 'WEAK', color: 'bg-red-500', textCol: 'text-red-500' };
    if (pass.length < 10) return { level: 2, text: 'FAIR', color: 'bg-yellow-500', textCol: 'text-yellow-600' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { level: 3, text: 'STRONG', color: 'bg-emerald-500', textCol: 'text-emerald-600' };
    }
    return { level: 2, text: 'FAIR', color: 'bg-yellow-500', textCol: 'text-yellow-600' };
  }, [formData.password]);

  const isPasswordMatch = formData.password && formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

// Sa SignUpPage.jsx - palitan ang handleSubmit function nito:

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');

  // ✅ VALIDATION FIRST bago mag-submit
  if (!isPasswordMatch) {
    setError('Passwords do not match');
    return;
  }

  if (!agreedToTerms) {
    setError('Please agree to the terms and conditions');
    return;
  }

  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }

  // ✅ THEN call register
  const result = await register(
    formData.fullName, 
    formData.email, 
    formData.password, 
    formData.confirmPassword,
    formData.organizationRole
  );

  if (result.success) {
    setSuccessMessage(result.message || 'Account created successfully! Please log in.');
    
    // Clear form
    setFormData({
      fullName: '',
      organizationRole: 'User',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setAgreedToTerms(false);
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  } else {
    setError(result.error || 'Failed to create account. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl text-center mb-10 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <img src={Logo} alt="Logo" className="w-14 h-14 mx-auto mb-6 drop-shadow-sm" />
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">
          Experience Architecture
        </h1>
        <p className="text-slate-500 font-medium">Join the next generation of event management</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Step into your new command center.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full" />
              {error}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-semibold rounded-lg flex items-center gap-2">
              <div className="w-1 h-1 bg-green-600 rounded-full" />
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="E.g. Alex Rivera"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Role</label>
                <div className="relative group">
                  <select
                    name="organizationRole"
                    value={formData.organizationRole}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="User">User</option>
                    <option value="OSAS">OSAS</option>
                    <option value="Property">Property</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-cyan-500" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-slate-50/50 border rounded-2xl py-3.5 pl-12 pr-12 text-sm outline-none transition-all ${
                      formData.confirmPassword ? (isPasswordMatch ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/10' : 'border-red-200 focus:border-red-500 focus:ring-red-500/10') : 'border-slate-200 focus:border-cyan-500'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {formData.confirmPassword && (isPasswordMatch ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Security Grade</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${strength.textCol}`}>{strength.text}</span>
              </div>
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3].map((idx) => (
                  <div 
                    key={idx}
                    className={`flex-1 rounded-full transition-all duration-500 ${idx <= strength.level ? strength.color : 'bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group px-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500/20 transition-all accent-cyan-600"
              />
              <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                By creating an account, I agree to the <span className="text-cyan-600 font-bold">Terms of Service</span> and acknowledge the <span className="text-cyan-600 font-bold">Privacy Policy</span>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedToTerms || !isPasswordMatch || strength.level < 2 || authLoading}
              className="w-full bg-slate-900 hover:bg-cyan-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Prefer to use existing credentials?{' '}
              <button onClick={onBack} className="text-cyan-600 font-bold hover:underline underline-offset-4 transition-all">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
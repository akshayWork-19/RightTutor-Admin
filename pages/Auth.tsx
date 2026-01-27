
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setAuth } from '../store';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean; name?: boolean }>({});
  const dispatch = useDispatch();

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (pass: string) => {
    // Basic secure requirements for this dashboard
    return pass.length >= 6;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newFieldErrors: typeof fieldErrors = {};
    let hasError = false;

    // Email validation
    if (!email) {
      newFieldErrors.email = true;
      setError('Email address is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      newFieldErrors.email = true;
      setError('Please enter a valid business email address');
      hasError = true;
    }

    // Password validation (Always check for login too as requested)
    if (!password) {
      newFieldErrors.password = true;
      if (!hasError) setError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      newFieldErrors.password = true;
      if (!hasError) setError('Password must be at least 6 characters');
      hasError = true;
    }

    // Name validation (Signup only)
    if (!isLogin && !name.trim()) {
      newFieldErrors.name = true;
      if (!hasError) setError('Full name is required for registration');
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return;
    }

    if (isLogin) {
      // Simulated Check
      const savedUser = JSON.parse(localStorage.getItem('rt_user_db') || 'null');
      if (savedUser && savedUser.email === email && savedUser.password === password) {
        dispatch(setUser(savedUser));
        dispatch(setAuth(true));
      } else if (email === 'admin@righttutor.com' && password === 'admin123') {
        dispatch(setUser({ name: 'Default Admin', email, phone: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' }));
        dispatch(setAuth(true));
      } else {
        setError('Invalid administrative credentials');
        setFieldErrors({ email: true, password: true });
      }
    } else {
      // Simulate registration
      const newUser = { name, email, password, phone: '', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` };
      localStorage.setItem('rt_user_db', JSON.stringify(newUser));
      setIsLogin(true); // Switch to login view after signup
      setName('');
      setEmail('');
      setPassword('');
      alert('Account created successfully. Please login with your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-[#E5DED4] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="h-2 bg-[#FF850A] w-full" />
        <div className="p-10 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#FF850A] rounded-[24px] flex items-center justify-center text-white font-black text-2xl mb-6 shadow-2xl shadow-[#FF850A]/30">RT</div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] brand-font tracking-tight">
              {isLogin ? 'Login' : 'Signup'}
            </h1>
            <p className="text-[#A0A0A0] text-[10px] font-black uppercase tracking-[0.25em] mt-3">RightTutor Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className={`w-full px-7 py-4 bg-[#FAF6F1] border ${fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-100' : 'border-[#E5DED4]'} rounded-2xl outline-none focus:ring-2 focus:ring-[#FF850A] focus:bg-white transition-all font-bold text-[#1A1A1A] placeholder:text-[#A0A0A0]/60`}
                />
              </div>
            )}
            
            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={`w-full px-7 py-4 bg-[#FAF6F1] border ${fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-100' : 'border-[#E5DED4]'} rounded-2xl outline-none focus:ring-2 focus:ring-[#FF850A] focus:bg-white transition-all font-bold text-[#1A1A1A] placeholder:text-[#A0A0A0]/60`}
              />
            </div>

            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`w-full px-7 py-4 bg-[#FAF6F1] border ${fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-100' : 'border-[#E5DED4]'} rounded-2xl outline-none focus:ring-2 focus:ring-[#FF850A] focus:bg-white transition-all font-bold text-[#1A1A1A] placeholder:text-[#A0A0A0]/60`}
              />
            </div>

            {error && (
              <div className="text-rose-600 text-[11px] font-bold text-center bg-rose-50 py-3 px-4 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-1">
                <span className="inline-block mr-2">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-2 py-4.5 bg-[#FF850A] text-white rounded-[24px] font-bold text-base hover:bg-[#E67809] shadow-xl shadow-[#FF850A]/20 transition-all active:scale-[0.98] py-4"
            >
              {isLogin ? 'Login' : 'Signup'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFieldErrors({});
              }}
              className="text-[11px] text-[#5A5A5A] font-bold hover:text-[#FF850A] transition-all underline underline-offset-8 decoration-[#E5DED4] hover:decoration-[#FF850A]"
            >
              {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
            </button>
          </div>
        </div>
        
        <div className="px-10 py-6 bg-[#FAF6F1]/50 border-t border-[#E5DED4] text-center">
          <p className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-widest">
            Protected Administrator Access Channel
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

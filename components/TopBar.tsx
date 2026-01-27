
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { AdminUser, toggleTheme, toggleSidebar } from '../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

interface TopBarProps {
  title: string;
  onLogout: () => void;
  adminUser: AdminUser;
}

const TopBar: React.FC<TopBarProps> = ({ title, onLogout, adminUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dataHeavyRoutes = ['/inquiries', '/appointments', '/manual-matching', '/google-sheets', '/logs'];
  const showSearch = dataHeavyRoutes.includes(location.pathname);

  return (
    <header className="h-16 bg-[var(--bg-card)]/70 backdrop-blur-md border-b border-[var(--border-ds)] flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-lg shrink-0"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div className="flex flex-col truncate">
            <h1 className="text-sm font-bold text-[var(--text-main)] tracking-tight truncate">{title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="live-link-pulse shrink-0"></span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hidden sm:inline">Live Linked to Sheets</span>
            </div>
        </div>
        
        {showSearch && (
          <div className="relative group hidden xl:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] scale-90">
              <Icons.Search />
            </span>
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9 pr-4 py-1.5 bg-[var(--bg-input)] border border-[var(--border-ds)] rounded-lg text-xs font-medium text-[var(--text-main)] focus:ring-1 focus:ring-[#FF850A]/30 focus:border-[#FF850A]/30 w-64 transition-all duration-200 outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-ds)] text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all group shrink-0"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2.5 p-1 rounded-lg transition-all ${
              showDropdown ? 'bg-[var(--bg-input)]' : 'hover:bg-[var(--bg-input)]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border-ds)] bg-[var(--bg-input)] shadow-sm shrink-0">
              <img src={adminUser.avatar} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <svg className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} hidden sm:block`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-60 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-ds)] overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-[var(--border-ds)]">
                <p className="text-xs font-bold text-[var(--text-main)] truncate">{adminUser.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{adminUser.email}</p>
              </div>
              <div className="p-1.5">
                <button 
                  onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-[var(--text-sub)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)] rounded-xl transition-all"
                >
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Account Settings
                </button>
                <div className="h-px bg-[var(--border-ds)] my-1.5 mx-2" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

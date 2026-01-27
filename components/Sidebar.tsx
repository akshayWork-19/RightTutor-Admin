
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setSidebarOpen } from '../store';
import { Icons } from '../constants';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { hasUnreadAiResponse, isSidebarOpen } = useSelector((state: RootState) => state.admin);

  const navItems = [
    { to: '/', icon: <Icons.Dashboard />, label: 'Dashboard' },
    { to: '/inquiries', icon: <Icons.Contact />, label: 'Inquiries' },
    { to: '/appointments', icon: <Icons.Calendar />, label: 'Bookings' },
    { to: '/manual-matching', icon: <Icons.Sync />, label: 'Manual Matches' },
  ];

  const closeSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-ds)] flex flex-col h-screen shrink-0 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white/10">R</div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[var(--text-main)] tracking-tight leading-none">RightTutor</span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Admin Portal</span>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-[var(--text-muted)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Main Menu</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      isActive 
                        ? 'bg-[var(--bg-input)] text-[var(--text-main)] shadow-sm' 
                        : 'text-[var(--text-sub)] hover:bg-[var(--bg-input)]/50 hover:text-[var(--text-main)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FF850A] rounded-r-full" />
                      )}
                      <span className={`${isActive ? 'text-[#FF850A]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'} transition-colors`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Intelligence</p>
            <NavLink
              to="/ai-assistant"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive 
                    ? 'bg-neutral-900 text-white shadow-xl dark:bg-white dark:text-neutral-900' 
                    : 'text-[var(--text-sub)] hover:bg-[var(--bg-input)]/50 hover:text-[var(--text-main)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <span className={`${isActive ? 'text-inherit' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'} transition-colors`}>
                      <Icons.Sparkles />
                    </span>
                    {hasUnreadAiResponse && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--bg-sidebar)] animate-pulse" />
                    )}
                  </div>
                  <span className="font-semibold">AI Assistant</span>
                </>
              )}
            </NavLink>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Settings</p>
            <div className="space-y-1">
              <NavLink
                to="/google-sheets"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive ? 'bg-[var(--bg-input)] text-[var(--text-main)]' : 'text-[var(--text-sub)] hover:bg-[var(--bg-input)]/50 hover:text-[var(--text-main)]'
                  }`
                }
              >
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span>Google Sheets</span>
              </NavLink>
              <NavLink
                to="/logs"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive ? 'bg-[var(--bg-input)] text-[var(--text-main)]' : 'text-[var(--text-sub)] hover:bg-[var(--bg-input)]/50 hover:text-[var(--text-main)]'
                  }`
                }
              >
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <span>System Logs</span>
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--border-ds)]">
           <NavLink
              to="/profile"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-[var(--bg-input)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-sub)] hover:bg-[var(--bg-input)]/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-full overflow-hidden border ${isActive ? 'border-[#FF850A]/30' : 'border-[var(--border-ds)]'} bg-[var(--bg-input)]`}>
                      <svg className="w-full h-full p-1.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="text-[13px] font-semibold">Settings</span>
                </>
              )}
            </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

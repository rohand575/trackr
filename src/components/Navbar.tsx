import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { logoutUser } from '../services/authService';
import { useToastStore } from '../store/useToastStore';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Subscriptions', icon: '💳' },
  { to: '/goals-habits', label: 'Goals & Habits', icon: '🎯' },
  { to: '/documents', label: 'Documents', icon: '🗂️' },
];

export const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      addToast('Logged out successfully', 'success');
    } catch {
      addToast('Failed to log out', 'error');
    } finally {
      setIsLoggingOut(false);
      setMenuOpen(false);
    }
  };

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Track<span className="text-indigo-600">r</span>
            </span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop user menu */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{emailInitial}</span>
              </div>
              <span className="text-sm text-gray-600 max-w-[180px] truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-5 h-5 flex flex-col justify-between">
                  <span className={`block h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 animate-slide-up">
            <nav className="flex flex-col gap-1 mb-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">{emailInitial}</span>
                </div>
                <span className="text-sm text-gray-600 truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// src/Header.js
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DownloadCloud, LogIn, LogOut, User } from 'lucide-react';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

const Header = () => {
  const location = useLocation();
  const [active, setActive] = useState('home');
  const { user, logout, setIsAuthModalOpen } = useContext(AuthContext);

  const handleClick = (section) => {
    setActive(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExport = () => {
    window.print();
  };

  const navItemStyle = (name) => {
    const isActive = active === name || location.pathname === (name === 'home' ? '/' : `/${name}`);
    return `relative px-4 py-2 font-medium text-sm transition-all duration-300 rounded-lg ${
      isActive 
        ? 'text-emerald-700 bg-emerald-50 shadow-sm' 
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm no-print">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-emerald-50 rounded-xl shadow-sm border border-emerald-100">
            <img src="/GHG_logo.png" alt="Logo" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
              GHG<span className="text-emerald-600">-FuseNet</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Live Forecasts • Smarter Alerts
            </p>
          </div>
        </div>

        {/* Right Section: Nav & Actions */}
        <div className="flex items-center space-x-6">
          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" onClick={() => handleClick('home')} className={navItemStyle('home')}>
              Dashboard
            </Link>
            <Link to="/about" onClick={() => handleClick('about')} className={navItemStyle('about')}>
              About
            </Link>
          </nav>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <DownloadCloud size={16} className="text-emerald-400" />
            <span>Export Report</span>
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <User size={14} className="text-emerald-600" />
                <span className="truncate max-w-[120px]">{user.email.split('@')[0]}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-bold rounded-lg transition-all duration-300"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

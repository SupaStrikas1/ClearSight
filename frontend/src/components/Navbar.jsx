'use client';

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/home" 
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-200">
                <span className="text-white font-bold text-sm sm:text-base">IE</span>
              </div>
              <span className="hidden sm:inline text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                Image Enhancer
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Home Link */}
            <Link 
              to="/home" 
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
            >
              Home
            </Link>

            {/* History Link */}
            <Link 
              to="/history" 
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
            >
              History
            </Link>

            {/* Logout Button */}
            <button 
              onClick={logout}
              className="px-3 sm:px-5 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 active:scale-95 border border-blue-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
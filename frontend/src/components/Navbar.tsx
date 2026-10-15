import React, { useState } from 'react';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Flame,
  Shield,
  MapPin,
  Globe,
  PhoneCall,
  User,
  LogOut,
  Menu,
  X,
  Droplets,
  Mic,
  Building,
  Sliders,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLocation, TAMIL_NADU_CITIES } from '../context/LocationContext';

export const Navbar: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { cityName, selectCityPreset, requestGeolocation, isGeolocationActive } = useLocation();
  const routerLocation = useRouterLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300">
                  HeatSafe AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider text-amber-400/80 uppercase px-1.5 py-0.5 rounded border border-amber-500/30">
                  Tamil Nadu
                </span>
              </div>
            </Link>

            {/* City / Location Selector */}
            <div className="relative ml-2 sm:ml-4">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                title="Change Regional Weather Location"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[110px] truncate">{cityName}</span>
                <span className="text-[10px] text-slate-500">▼</span>
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Select Tamil Nadu District</span>
                    <button
                      onClick={() => {
                        requestGeolocation();
                        setCityDropdownOpen(false);
                      }}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Compass className="w-3 h-3" /> GPS
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {TAMIL_NADU_CITIES.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          selectCityPreset(c);
                          setCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-300 flex items-center justify-between"
                      >
                        <span>{c.name}</span>
                        <span className="text-[11px] text-slate-500 font-tamil">{c.nameTa}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t('nav_dashboard')}
            </Link>

            <Link
              to="/heat-risk"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/heat-risk') ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t('nav_heat_risk')}
            </Link>

            <Link
              to="/hydration"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/hydration') ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t('nav_hydration')}
            </Link>

            <Link
              to="/facilities"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/facilities') ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t('nav_facilities')}
            </Link>

            <Link
              to="/assistant"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/assistant') ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              {t('nav_assistant')}
            </Link>

            {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
              <Link
                to="/employer"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive('/employer') ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t('nav_employer')}
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive('/admin') ? 'bg-rose-500/20 text-rose-300' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t('nav_admin')}
              </Link>
            )}
          </div>

          {/* Right Action Tools: Language Switcher, 108 Emergency, Profile/Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-amber-300 transition-colors"
              title="Toggle Tamil / English"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('language_toggle')}</span>
            </button>

            {/* Direct 108 Emergency Call */}
            <a
              href="tel:108"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-900/40 transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>108</span>
            </a>

            {/* Auth controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-sm transition-all"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            {t('nav_dashboard')}
          </Link>
          <Link
            to="/heat-risk"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            {t('nav_heat_risk')}
          </Link>
          <Link
            to="/hydration"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            {t('nav_hydration')}
          </Link>
          <Link
            to="/facilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            {t('nav_facilities')}
          </Link>
          <Link
            to="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-slate-900 flex items-center gap-2"
          >
            <Mic className="w-4 h-4 text-amber-400" />
            {t('nav_assistant')}
          </Link>
          <Link
            to="/guidance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            {t('nav_guidance')}
          </Link>
          {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
            <Link
              to="/employer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-300 hover:bg-slate-900"
            >
              {t('nav_employer')}
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-slate-900"
            >
              {t('nav_admin')}
            </Link>
          )}
          <div className="pt-2 border-t border-slate-800">
            <a
              href="tel:108"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 text-white font-bold text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              {t('emergency_call_btn')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

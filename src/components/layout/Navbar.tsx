import React, { useState } from 'react';
import { Scale, Search, Menu, X, Globe, ShieldCheck, User, LogOut } from 'lucide-react';
import { PageView, Language, UserSession } from '../../types';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onOpenSearch?: () => void;
  onOpenBackendSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  language,
  setLanguage,
  currentUser,
  onLogout,
  onOpenSearch,
  onOpenBackendSetup
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageView; labelEn: string; labelBn: string }[] = [
    { id: 'home', labelEn: 'Home', labelBn: 'মূলপাতা' },
    { id: 'evidence', labelEn: 'Land Records', labelBn: 'জমি রেকর্ড' },
    { id: 'satellite', labelEn: 'Services', labelBn: 'সেবাসমূহ' },
    { id: 'about', labelEn: 'About', labelBn: 'আমাদের সম্পর্কে' },
    { id: 'claims', labelEn: 'Contact', labelBn: 'যোগাযোগ' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#123B32] text-white border-b border-[#1b4e43] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-[#C6A66B] group-hover:text-[#123B32] transition-colors duration-200">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-bold tracking-tight text-white font-serif-title">Shikor</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#C6A66B]/20 text-[#C6A66B] border border-[#C6A66B]/30 hidden sm:inline-block">
                  LandTech
                </span>
              </div>
              <p className="text-[11px] text-[#D8E8DF]/80 font-normal tracking-wide">
                {language === 'bn' ? 'নদীভাঙন প্রমাণ ও ন্যায্য পুনর্বাসন' : 'Land Records for a Fairer Tomorrow'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-medium transition-colors relative py-2 ${
                    isActive 
                      ? 'text-[#C6A66B] font-semibold' 
                      : 'text-[#D8E8DF] hover:text-white'
                  }`}
                >
                  {language === 'bn' ? item.labelBn : item.labelEn}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A66B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Supabase Backend Setup Hub Button */}
            <button
              onClick={onOpenBackendSetup}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 transition-colors shadow-sm"
              title="Connect Supabase Backend"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>⚡ Supabase</span>
            </button>

            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#D8E8DF] hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title={language === 'bn' ? 'খতিয়ান বা দাগ নম্বর খুঁজুন' : 'Search Khatian / Dag No'}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded border border-white/20 text-[#D8E8DF] hover:text-white hover:border-white/40 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'BN' : 'EN'}</span>
            </button>

            {/* User Session Profile OR Login / Sign Up */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {/* Profile Pill Button */}
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`flex items-center space-x-2 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 shadow-sm ${
                    currentPage === 'profile'
                      ? 'bg-white text-[#123B32] border-white ring-2 ring-[#C6A66B]'
                      : 'bg-[#1b4e43] border-[#C6A66B]/50 hover:border-[#C6A66B] text-white hover:bg-[#235e52]'
                  }`}
                  title={language === 'bn' ? 'আমার প্রোফাইল দেখুন' : 'View Citizen Profile'}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentPage === 'profile' ? 'bg-[#123B32] text-white' : 'bg-[#C6A66B] text-[#123B32]'
                  }`}>
                    {currentUser.role === 'official' ? '🏛️' : (currentUser.fullNameEn ? currentUser.fullNameEn.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold leading-tight max-w-[110px] truncate">
                      {currentUser.fullNameEn.split(' ')[0]}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-[#C6A66B] font-semibold">
                      {currentUser.role === 'official' ? 'AC Land' : 'Citizen'}
                    </span>
                  </div>
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-[#D8E8DF] hover:text-rose-300 hover:bg-rose-500/20 rounded-full transition-colors border border-transparent hover:border-rose-400/30"
                  title={language === 'bn' ? 'লগআউট' : 'Sign Out'}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Login Button (Outline Pill) */}
                <button
                  onClick={() => setCurrentPage('signin')}
                  className={`px-5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                    currentPage === 'signin'
                      ? 'bg-white text-[#123B32] border-white'
                      : 'border-white/70 text-white hover:bg-white/10'
                  }`}
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </button>

                {/* Sign Up Button (Accent Gold) */}
                <button
                  onClick={() => setCurrentPage('signup')}
                  className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 shadow-sm ${
                    currentPage === 'signup'
                      ? 'bg-white text-[#123B32]'
                      : 'bg-[#C6A66B] hover:bg-[#b5955a] text-[#123B32]'
                  }`}
                >
                  {language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2 py-1 text-xs rounded border border-white/20 text-[#D8E8DF]"
            >
              {language === 'en' ? 'বাং' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d2a24] border-t border-[#1b4e43] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'bg-[#1b4e43] text-[#C6A66B] font-semibold'
                    : 'text-[#D8E8DF] hover:bg-white/5'
                }`}
              >
                {language === 'bn' ? item.labelBn : item.labelEn}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1b4e43]">
            {currentUser ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#1b4e43] border border-[#C6A66B]/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#C6A66B] text-[#123B32] font-bold flex items-center justify-center text-sm">
                      {currentUser.fullNameEn ? currentUser.fullNameEn.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {currentUser.fullNameEn}
                      </p>
                      <p className="text-[10px] text-[#C6A66B]">
                        {currentUser.role === 'official' ? 'AC Land Officer' : 'Citizen Landowner'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-center rounded-lg bg-white text-[#123B32]"
                  >
                    {language === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}
                  </button>
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-medium text-center rounded-lg border border-rose-400/50 text-rose-300 hover:bg-rose-500/20"
                  >
                    {language === 'bn' ? 'লগআউট' : 'Sign Out'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCurrentPage('signin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-medium text-center rounded-full border border-white/60 text-white hover:bg-white/10"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-bold text-center rounded-full bg-[#C6A66B] text-[#123B32]"
                >
                  {language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { PageView, SiteConfig } from '../types';
import { 
  Menu, 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  Database,
  ArrowRight,
  Code2
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView, slug?: string) => void;
  onOpenSearch: () => void;
  savedCount: number;
  siteConfig: SiteConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch,
  savedCount,
  siteConfig,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: PageView }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Blog', page: 'blog' },
    { label: 'About', page: 'about' },
    { label: 'Links', page: 'links' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 group text-left focus:outline-none"
          >
            {siteConfig.logoImageUrl ? (
              <img src={siteConfig.logoImageUrl} alt="Logo" className="w-10 h-10 object-cover border-2 border-black neo-shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-black text-[var(--color-primary)] flex items-center justify-center font-display font-black text-xl border-2 border-black neo-shadow-sm group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                {siteConfig.logoPart1.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter leading-none text-black">
                {siteConfig.logoPart1}<span className="text-[var(--color-accent)]">{siteConfig.logoPart2}</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
                {siteConfig.tagline}
              </span>
            </div>
          </button>

          {/* Desktop Sticker Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-[var(--color-success)] text-black font-mono text-xs font-black uppercase px-2.5 py-1 border-2 border-black neo-shadow-sm rotate-[-2deg]">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>BUILD IN PUBLIC</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-bold uppercase text-sm">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                id={`nav-link-${link.page}`}
                onClick={() => handleNavClick(link.page)}
                className={`transition-all font-display uppercase text-sm ${
                  isActive
                    ? 'font-black text-black underline decoration-4 underline-offset-4 decoration-[var(--color-secondary)]'
                    : 'text-black hover:underline'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Search Trigger */}
          <button
            id="search-trigger-btn"
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-2 bg-white border-2 border-black neo-shadow-sm hover:bg-[var(--color-primary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform flex items-center space-x-1.5 text-black font-mono text-xs font-bold"
            title="Search articles (Ctrl+K)"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">SEARCH</span>
            <kbd className="hidden lg:inline-block bg-neutral-100 text-black px-1.5 py-0.5 text-[10px] border border-black font-mono">
              /
            </kbd>
          </button>

          {/* Prominent Read CTA */}
          <button
            id="header-read-cta-btn"
            onClick={() => handleNavClick('blog')}
            className="bg-black text-white px-5 py-2 font-bold uppercase text-xs neo-shadow-sm transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[var(--color-primary)] hover:text-black border-2 border-black flex items-center space-x-1.5"
          >
            <span>READ THE BLOG</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[var(--color-primary)] border-2 border-black neo-shadow-sm text-black"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 stroke-[3]" /> : <Menu className="w-6 h-6 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-black bg-white p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  id={`mobile-nav-${link.page}`}
                  onClick={() => handleNavClick(link.page)}
                  className={`py-3 px-4 text-center font-display font-black text-base uppercase border-2 border-black transition-all ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-black neo-shadow-sm'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t-2 border-black flex flex-col gap-2.5">
            <button
              id="mobile-read-blog-btn"
              onClick={() => handleNavClick('blog')}
              className="w-full py-3 bg-[var(--color-accent)] text-black font-display font-black text-base uppercase border-2 border-black neo-shadow-sm flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
              <span>EXPLORE ALL ARTICLES</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

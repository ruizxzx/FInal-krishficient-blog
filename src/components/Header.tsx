import React, { useState } from 'react';
import { PageView, SiteConfig, CommunityUser } from '../types';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  Menu, 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  Database,
  ArrowRight,
  Code2,
  LogIn,
  LogOut,
  User,
  AtSign,
  Bookmark,
  Home,
  Users,
  LayoutGrid
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView, slug?: string) => void;
  onOpenSearch: () => void;
  savedCount: number;
  siteConfig: SiteConfig;
  userProfile?: CommunityUser | null;
  onOpenHandleModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch,
  savedCount,
  siteConfig,
  userProfile,
  onOpenHandleModal,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, loading] = useAuthState(auth);

  const mainNavLinks = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Blog', page: 'blog', icon: BookOpen },
    { label: 'Community', page: 'community', icon: Users },
    { label: 'Saved', page: 'saved', count: savedCount, icon: Bookmark },
  ] as const;

  const sidebarLinks = [
    { label: 'About', page: 'about' },
    { label: 'Links', page: 'links' },
    { label: 'Contact', page: 'contact' },
  ] as const;

  const handleNavClick = (page: PageView, param?: string) => {
    onNavigate(page, param);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error('Sign in error:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <>
      {/* Spacer to push content down a bit since we removed the static header, but this keeps the page from cutting off at the very top if desired. Actually, a top fixed logo is better. */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-2.5 group text-left focus:outline-none bg-white p-2 border-2 border-black neo-shadow-sm hover:bg-[var(--color-primary)] transition-colors"
        >
          {siteConfig.logoImageUrl ? (
            <img src={siteConfig.logoImageUrl} alt="Logo" className="w-8 h-8 object-cover border-2 border-black" />
          ) : (
            <div className="w-8 h-8 bg-black text-[var(--color-primary)] flex items-center justify-center font-display font-black text-lg border-2 border-black group-hover:bg-white group-hover:text-black transition-colors">
              {siteConfig.logoPart1.charAt(0)}
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter leading-none text-black">
              {siteConfig.logoPart1}<span className="text-[var(--color-accent)]">{siteConfig.logoPart2}</span>
            </span>
          </div>
        </button>
      </div>

      {/* Floating Bottom Navbar */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-0 sm:w-auto max-w-lg">
        <nav className="bg-white border-4 border-black neo-shadow-sm flex items-center justify-between sm:justify-center p-1.5 sm:p-2 space-x-1 sm:space-x-2 w-full">
           {mainNavLinks.map((link) => {
             const isActive = currentPage === link.page;
             const Icon = link.icon;
             return (
               <button
                 key={link.page}
                 onClick={() => handleNavClick(link.page as PageView)}
                 className={`relative flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 font-display font-black text-[10px] sm:text-xs uppercase transition-all ${
                   isActive ? 'bg-[var(--color-primary)] text-black border-2 border-black neo-shadow-sm' : 'hover:bg-neutral-100 border-2 border-transparent text-neutral-600 hover:text-black'
                 }`}
                 title={link.label}
               >
                 <Icon className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5] mb-1 sm:mb-0" />
                 <span>{link.label}</span>
                 {link.page === 'saved' && link.count !== undefined && link.count > 0 && (
                   <span className="absolute top-1 right-1 sm:-top-2 sm:-right-2 bg-black text-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-mono border-2 border-black">
                     {link.count}
                   </span>
                 )}
               </button>
             );
           })}
           
           <div className="hidden sm:block w-1 h-8 bg-black mx-1" /> {/* Divider */}
           
           <button
             onClick={() => setSidebarOpen(true)}
             className="relative flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 font-display font-black text-[10px] sm:text-xs uppercase transition-all hover:bg-neutral-100 border-2 border-transparent text-neutral-600 hover:text-black"
           >
             <Menu className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5] mb-1 sm:mb-0" />
             <span>Menu</span>
           </button>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white border-l-4 border-black z-[70] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col shadow-2xl`}>
        <div className="p-4 border-b-4 border-black flex items-center justify-between bg-[var(--color-primary)]">
          <div className="font-display font-black text-xl uppercase tracking-tight">Menu</div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white border-2 border-black neo-shadow-sm hover:bg-red-100 transition-colors">
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
           {/* Search */}
           <div>
             <h3 className="font-mono text-xs font-bold uppercase text-neutral-500 mb-3">Discover</h3>
             <button
               onClick={() => { onOpenSearch(); setSidebarOpen(false); }}
               className="w-full py-3 px-4 bg-white border-2 border-black neo-shadow-sm hover:bg-[var(--color-primary)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-between text-black font-display text-sm font-black uppercase"
             >
               <div className="flex items-center space-x-2">
                 <Search className="w-4 h-4 stroke-[3]" />
                 <span>Search Articles</span>
               </div>
               <span className="font-mono text-[10px] text-neutral-500">CTRL+K</span>
             </button>
           </div>
           
           {/* Additional Links */}
           <div>
             <h3 className="font-mono text-xs font-bold uppercase text-neutral-500 mb-3">Pages</h3>
             <div className="flex flex-col gap-2">
               {sidebarLinks.map((link) => (
                 <button
                   key={link.page}
                   onClick={() => handleNavClick(link.page as PageView)}
                   className={`w-full text-left py-3 px-4 font-display font-black text-sm uppercase border-2 border-black transition-all flex items-center justify-between ${
                     currentPage === link.page
                       ? 'bg-black text-white neo-shadow-sm'
                       : 'bg-white text-black hover:bg-neutral-100 neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                   }`}
                 >
                   <span>{link.label}</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
               ))}
             </div>
           </div>

           {/* User Auth */}
           <div className="mt-auto pt-8 border-t-4 border-black">
             <h3 className="font-mono text-xs font-bold uppercase text-neutral-500 mb-3">Account</h3>
             {!loading && (
                <>
                  {!user ? (
                    <button
                      onClick={() => { handleGoogleSignIn(); setSidebarOpen(false); }}
                      className="w-full py-3 bg-[var(--color-accent)] text-black font-display font-black text-sm uppercase border-2 border-black neo-shadow-sm flex items-center justify-center space-x-2 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <LogIn className="w-4 h-4 stroke-[3]" />
                      <span>SIGN IN WITH GOOGLE</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {userProfile ? (
                        <button
                          onClick={() => handleNavClick('community_profile', userProfile.username)}
                          className="w-full py-3 px-4 bg-neutral-100 hover:bg-[var(--color-secondary)] border-2 border-black font-mono text-sm font-bold flex items-center justify-between transition-colors neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                        >
                          <div className="flex items-center space-x-2">
                            {userProfile.photoURL ? (
                              <img src={userProfile.photoURL} alt="" className="w-6 h-6 rounded-full border border-black object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-black" />
                            )}
                            <span>@{userProfile.username}</span>
                          </div>
                          <span className="text-[10px] uppercase underline">Profile</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { onOpenHandleModal?.(); setSidebarOpen(false); }}
                          className="w-full py-3 px-4 bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-black border-2 border-black font-display text-sm font-black uppercase flex items-center justify-center space-x-2 animate-pulse neo-shadow-sm"
                        >
                          <AtSign className="w-4 h-4 stroke-[3]" />
                          <span>CLAIM YOUR @HANDLE</span>
                        </button>
                      )}
                      <button
                        onClick={() => { handleSignOut(); setSidebarOpen(false); }}
                        className="w-full py-2.5 bg-white hover:bg-red-100 text-black hover:text-red-700 border-2 border-black font-mono text-xs font-bold uppercase transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
             )}
           </div>
        </div>
      </div>
    </>
  );
};


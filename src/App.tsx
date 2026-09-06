import React, { useState, useEffect, useCallback } from 'react';
import { Article, PageView, SiteConfig, BentoLink, CommunityUser } from './types';
import { fetchArticles, getCustomLocalArticles, deleteCustomLocalArticle } from './lib/sanity';
import { Header } from './components/Header';
import { MarqueeTicker } from './components/MarqueeTicker';
import { HomeView } from './components/HomeView';
import { BlogView } from './components/BlogView';
import { ArticleView } from './components/ArticleView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { LinksView } from './components/LinksView';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AdminStudioModal } from './components/AdminStudioModal';
import { RssModal } from './components/RssModal';
import { CommunityView } from './components/CommunityView';
import { CommunityPostView } from './components/CommunityPostView';
import { CommunityProfileView } from './components/CommunityProfileView';
import { SavedView } from './components/SavedView';
import { UniqueHandleModal } from './components/UniqueHandleModal';
import { auth } from './lib/firebase';
import { getCommunityProfile, getUserSaves, toggleUserSaveInCloud } from './lib/community';
import { Loader2 } from 'lucide-react';

const SAVED_SLUGS_KEY = 'krishficient_saved_slugs_v1';
const SAVED_COMMUNITY_KEY = 'krishficient_saved_community_v1';
const SITE_CONFIG_KEY = 'krishficient_site_config_v1';
const BENTO_LINKS_KEY = 'krishficient_bento_links_v1';

const DEFAULT_BENTO_LINKS: BentoLink[] = [
  { id: '1', title: 'Follow on X', url: '#', icon: 'twitter', isFeatured: true, color: 'var(--color-secondary)', order: 1 },
  { id: '2', title: 'GitHub Hub', url: '#', icon: 'github', isFeatured: false, color: '#ffffff', order: 2 },
  { id: '3', title: 'Coding Playlist', url: '#', icon: 'music', isFeatured: false, color: 'var(--color-success)', order: 3 },
];

const DEFAULT_SITE_CONFIG: SiteConfig = {
  logoImageUrl: "",
  logoPart1: "KRISH",
  logoPart2: "FICIENT",
  tagline: "INDEPENDENT TECH PRESS",
  heroHeadline: "Build. Learn.\nCreate.",
  heroSubheadline: "A premium publication dedicated to software engineering, computer science, and the art of building practical technology.",
  heroBgColor: "var(--color-secondary)",
  manifestoText: "KRISHFICIENT exists to write the deep technical essays I wish I had found when architecting complex, scale-resistant systems.",
  manifestoAuthor: "— Founder",
  authorName: "KRISH",
  authorRole: "Lead Architect & Researcher",
  authorAvatarUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
  aboutMeTitle: "ABOUT THE AUTHOR",
  aboutMeBio: "I am a software engineer and systems architect specializing in high-performance web applications and distributed systems.\n\nOver the past decade, I have built infrastructure that scales to millions of users, designed resilient microservices, and obsessed over web performance metrics.",
  
  // Advanced Global Settings Defaults
  themePrimaryColor: "#FFD600",
  themeSecondaryColor: "#00E0FF",
  themeAccentColor: "#FF60B5",
  themeSuccessColor: "#00FF41",
  
  // Footer Defaults
  footerNewsletterTitle: "RECEIVE DEEP TECHNICAL ESSAYS IN YOUR INBOX",
  footerNewsletterSubtitle: "Zero spam. Zero generic marketing. Only in-depth software architectural breakdowns, local AI research, and production post-mortems.",
  footerBrandStatement: "An independent technology publication engineered by Krish. Fusing Neo-Brutalism, Gumroad minimalism, and Medium-grade editorial craft for software builders worldwide.",
  
  // Contact Page Defaults
  contactTitle: "SECURE COMM CHANNEL",
  contactSubtitle: "For architectural consulting, secure protocol design, or technical inquiries.",
  contactEmail: "hello@krishficient.dev",
  contactTwitter: "@krishficient",
  contactGithub: "krishficient",
  contactTelegram: "@krishficient"
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Posts');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'sanity' | 'local'>('local');

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const stored = localStorage.getItem(SITE_CONFIG_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SITE_CONFIG;
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  });

  const [bentoLinks, setBentoLinks] = useState<BentoLink[]>(() => {
    try {
      const stored = localStorage.getItem(BENTO_LINKS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_BENTO_LINKS;
    } catch {
      return DEFAULT_BENTO_LINKS;
    }
  });

  const handleUpdateBentoLinks = (links: BentoLink[]) => {
    setBentoLinks(links);
    try {
      localStorage.setItem(BENTO_LINKS_KEY, JSON.stringify(links));
    } catch (e) {
      console.warn('LocalStorage save failed for bento links:', e);
    }
  };

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isRssOpen, setIsRssOpen] = useState(false);

  // Bookmarked / Saved articles state
  const [savedSlugs, setSavedSlugs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_SLUGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedCommunityPostIds, setSavedCommunityPostIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_COMMUNITY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [userAuth, setUserAuth] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState<CommunityUser | null>(null);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);

  // Sync auth state & cloud saved items
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setUserAuth(user);
      if (user) {
        // Load profile
        try {
          const prof = await getCommunityProfile(user.uid);
          setUserProfile(prof);
        } catch (e) {
          console.error("Error loading user profile:", e);
        }

        // Load cloud saves
        try {
          const cloudSaves = await getUserSaves(user.uid);
          if (cloudSaves && cloudSaves.length > 0) {
            const cloudArticleSlugs = cloudSaves.filter(s => s.itemType === 'article').map(s => s.itemId);
            const cloudCommunityIds = cloudSaves.filter(s => s.itemType === 'post').map(s => s.itemId);

            setSavedSlugs(prev => {
              const merged = Array.from(new Set([...prev, ...cloudArticleSlugs]));
              try { localStorage.setItem(SAVED_SLUGS_KEY, JSON.stringify(merged)); } catch {}
              return merged;
            });

            setSavedCommunityPostIds(prev => {
              const merged = Array.from(new Set([...prev, ...cloudCommunityIds]));
              try { localStorage.setItem(SAVED_COMMUNITY_KEY, JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        } catch (e) {
          console.error("Error loading cloud saves:", e);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // Load articles on mount
  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const { articles: fetched, source } = await fetchArticles();
      setArticles(fetched);
      setDataSource(source);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Apply dynamic theme colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', siteConfig.themePrimaryColor || '#FFD600');
    root.style.setProperty('--color-secondary', siteConfig.themeSecondaryColor || '#00E0FF');
    root.style.setProperty('--color-accent', siteConfig.themeAccentColor || '#FF60B5');
    root.style.setProperty('--color-success', siteConfig.themeSuccessColor || '#00FF41');
  }, [
    siteConfig.themePrimaryColor,
    siteConfig.themeSecondaryColor,
    siteConfig.themeAccentColor,
    siteConfig.themeSuccessColor
  ]);

  // URL Hash Sync for standard navigation & browser back button support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'home') {
        setCurrentPage('home');
        setActiveArticleSlug(null);
      } else if (hash === 'blog') {
        setCurrentPage('blog');
        setActiveArticleSlug(null);
      } else if (hash.startsWith('article/')) {
        const slug = hash.replace('article/', '');
        setActiveArticleSlug(slug);
        setCurrentPage('article');
      } else if (hash === 'about') {
        setCurrentPage('about');
        setActiveArticleSlug(null);
      } else if (hash === 'contact') {
        setCurrentPage('contact');
        setActiveArticleSlug(null);
      } else if (hash === 'links') {
        setCurrentPage('links');
        setActiveArticleSlug(null);
      } else if (hash === 'saved') {
        setCurrentPage('saved');
        setActiveArticleSlug(null);
      } else if (hash === 'community') {
        setCurrentPage('community');
        setActiveArticleSlug(null);
      } else if (hash.startsWith('community/post/')) {
        const id = hash.replace('community/post/', '');
        setActiveArticleSlug(id); // reusing activeArticleSlug state to hold param
        setCurrentPage('community_post');
      } else if (hash.startsWith('@')) {
        const username = hash.replace('@', '');
        setActiveArticleSlug(username);
        setCurrentPage('community_profile');
      } else if (hash === 'cms' || hash === 'admin') {
        setCurrentPage('cms');
        setActiveArticleSlug(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageView, param?: string) => {
    if (page === 'article' && param) {
      setActiveArticleSlug(param);
      setCurrentPage('article');
      window.location.hash = `article/${param}`;
    } else if (page === 'community_post' && param) {
      setActiveArticleSlug(param);
      setCurrentPage('community_post');
      window.location.hash = `community/post/${param}`;
    } else if (page === 'community_profile' && param) {
      setActiveArticleSlug(param);
      setCurrentPage('community_profile');
      window.location.hash = `@${param}`;
    } else {
      setActiveArticleSlug(null);
      setCurrentPage(page);
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = async (slug: string) => {
    const targetArticle = articles.find(a => a.slug === slug);
    const willBeSaved = !savedSlugs.includes(slug);

    setSavedSlugs((prev) => {
      const next = willBeSaved
        ? [...prev, slug]
        : prev.filter((s) => s !== slug);
      try {
        localStorage.setItem(SAVED_SLUGS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      return next;
    });

    if (userAuth) {
      try {
        await toggleUserSaveInCloud(
          userAuth.uid,
          slug,
          'article',
          !willBeSaved,
          targetArticle?.title || slug
        );
      } catch (e) {
        console.error("Error saving dispatch to cloud:", e);
      }
    }
  };

  const handleToggleSaveCommunity = async (postId: string, title?: string) => {
    const willBeSaved = !savedCommunityPostIds.includes(postId);

    setSavedCommunityPostIds((prev) => {
      const next = willBeSaved
        ? [...prev, postId]
        : prev.filter((id) => id !== postId);
      try {
        localStorage.setItem(SAVED_COMMUNITY_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage save failed for community post:', e);
      }
      return next;
    });

    if (userAuth) {
      try {
        await toggleUserSaveInCloud(
          userAuth.uid,
          postId,
          'post',
          !willBeSaved,
          title || 'Community Post'
        );
      } catch (e) {
        console.error("Error saving community post to cloud:", e);
      }
    }
  };

  const handleArticlePublished = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev.filter((a) => a.slug !== newArticle.slug)]);
    navigateTo('article', newArticle.slug);
  };

  const handleDeleteArticle = (slug: string) => {
    deleteCustomLocalArticle(slug);
    setArticles((prev) => prev.filter((a) => a.slug !== slug));
  };

  const handleUpdateSiteConfig = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    try {
      localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save config:', e);
    }
  };

  const activeArticle = articles.find((a) => a.slug === activeArticleSlug);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-[var(--color-primary)] selection:text-black pb-28">
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCms={() => setIsCmsOpen(true)}
        savedCount={savedSlugs.length + savedCommunityPostIds.length}
        siteConfig={siteConfig}
        userProfile={userProfile}
        onOpenHandleModal={() => setIsHandleModalOpen(true)}
      />

      {/* Spacer for Top Fixed Logo */}
      <div className="pt-20 sm:pt-24" />

      {/* Marquee Ticker */}
      <MarqueeTicker />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-black stroke-[3]" />
            <div className="font-display font-black text-xl uppercase tracking-wider">
              LOADING DISPATCHES...
            </div>
            <div className="font-mono text-xs text-neutral-500">
              SYNCHRONIZING {siteConfig.logoPart1}{siteConfig.logoPart2} REPOSITORY
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomeView
                articles={articles}
                onNavigate={navigateTo}
                onSelectArticle={(slug) => navigateTo('article', slug)}
                savedSlugs={savedSlugs}
                onToggleSave={handleToggleSave}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  navigateTo('blog');
                }}
                siteConfig={siteConfig}
              />
            )}

            {currentPage === 'blog' && (
              <BlogView
                articles={articles}
                onSelectArticle={(slug) => navigateTo('article', slug)}
                savedSlugs={savedSlugs}
                onToggleSave={handleToggleSave}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {currentPage === 'article' && (
              activeArticle ? (
                <ArticleView
                  article={activeArticle}
                  allArticles={articles}
                  onBack={() => navigateTo('blog')}
                  onSelectArticle={(slug) => navigateTo('article', slug)}
                  isSaved={savedSlugs.includes(activeArticle.slug)}
                  onToggleSave={handleToggleSave}
                  siteConfig={siteConfig}
                />
              ) : (
                <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-6">
                  <div className="w-16 h-16 bg-[var(--color-accent)] neo-border neo-shadow mx-auto flex items-center justify-center font-display font-black text-2xl">
                    404
                  </div>
                  <h2 className="font-display font-black text-3xl uppercase tracking-tight">
                    ESSAY NOT FOUND
                  </h2>
                  <p className="font-sans text-neutral-600">
                    The requested dispatch slug "{activeArticleSlug}" could not be located in the current repository.
                  </p>
                  <button
                    onClick={() => navigateTo('blog')}
                    className="px-6 py-3 bg-[var(--color-primary)] text-black font-display font-black text-sm uppercase neo-border neo-shadow-sm hover:bg-black hover:text-[var(--color-primary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    RETURN TO ARCHIVE
                  </button>
                </div>
              )
            )}

            {currentPage === 'about' && (
              <AboutView onNavigate={navigateTo} siteConfig={siteConfig} />
            )}

            {currentPage === 'saved' && (
              <SavedView 
                savedSlugs={savedSlugs} 
                savedCommunityPostIds={savedCommunityPostIds}
                articles={articles} 
                onNavigate={navigateTo} 
                onToggleSaveArticle={handleToggleSave} 
                onToggleSaveCommunityPost={handleToggleSaveCommunity}
                userAuth={userAuth}
                userProfile={userProfile}
              />
            )}

            {currentPage === 'community' && (
              <CommunityView 
                onNavigate={navigateTo}
                userProfile={userProfile}
                onOpenHandleModal={() => setIsHandleModalOpen(true)}
                savedCommunityPostIds={savedCommunityPostIds}
                onToggleSaveCommunityPost={handleToggleSaveCommunity}
                onProfileUpdated={(p) => setUserProfile(p)}
              />
            )}
            
            {currentPage === 'community_post' && activeArticleSlug && (
              <CommunityPostView 
                postId={activeArticleSlug} 
                onNavigate={navigateTo} 
                isSaved={savedCommunityPostIds.includes(activeArticleSlug)}
                onToggleSave={(id, title) => handleToggleSaveCommunity(id, title)}
              />
            )}
            
            {currentPage === 'community_profile' && activeArticleSlug && (
              <CommunityProfileView 
                username={activeArticleSlug} 
                onNavigate={navigateTo} 
                currentUserProfile={userProfile} 
              />
            )}

            {currentPage === 'links' && (
              <LinksView links={bentoLinks} siteConfig={siteConfig} />
            )}

            {currentPage === 'contact' && (
              <ContactView siteConfig={siteConfig} />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(slug) => navigateTo('article', slug)}
      />

      <AdminStudioModal
        isOpen={isCmsOpen || currentPage === 'cms'}
        onClose={() => {
          setIsCmsOpen(false);
          if (currentPage === 'cms') {
            navigateTo('home');
          }
        }}
        onArticlePublished={handleArticlePublished}
        articles={articles}
        onDeleteArticle={handleDeleteArticle}
        siteConfig={siteConfig}
        onUpdateSiteConfig={handleUpdateSiteConfig}
        bentoLinks={bentoLinks}
        onUpdateBentoLinks={handleUpdateBentoLinks}
      />

      <RssModal
        isOpen={isRssOpen}
        onClose={() => setIsRssOpen(false)}
        articles={articles}
      />

      <UniqueHandleModal
        isOpen={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        currentUser={userAuth}
        onProfileCreated={(profile) => {
          setUserProfile(profile);
          setIsHandleModalOpen(false);
        }}
      />

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenCms={() => setIsCmsOpen(true)}
        onOpenRssModal={() => setIsRssOpen(true)}
        siteConfig={siteConfig}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Article, Category, SiteConfig, BentoLink } from '../types';
import { 
  X, 
  Database, 
  PlusCircle, 
  Check, 
  Settings,
  Trash2,
  AlertCircle,
  Smartphone,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Edit2,
  Shield
} from 'lucide-react';
import { SANITY_CONFIG, saveCustomLocalArticle } from '../lib/sanity';
import { loginWithGoogle, auth, logout } from '../lib/firebase';

const ALLOWED_ADMIN_EMAILS = ['ruizxzxz@gmail.com', 'krishsarkar456@gmail.com'];

interface AdminStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticlePublished: (article: Article) => void;
  articles: Article[];
  onDeleteArticle: (slug: string) => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  bentoLinks: BentoLink[];
  onUpdateBentoLinks: (links: BentoLink[]) => void;
}

export const AdminStudioModal: React.FC<AdminStudioModalProps> = ({
  isOpen,
  onClose,
  onArticlePublished,
  articles,
  onDeleteArticle,
  siteConfig,
  onUpdateSiteConfig,
  bentoLinks,
  onUpdateBentoLinks
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email && ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const user = await loginWithGoogle();
      if (user && user.email && ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        setIsAuthenticated(true);
      } else {
        alert("Access Denied: You are not an authorized administrator.");
        await logout();
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings' | 'links' | 'sanity'>('settings');

  // Site Config Form state
  const [logoImageUrl, setLogoImageUrl] = useState(siteConfig.logoImageUrl || '');
  const [logoPart1, setLogoPart1] = useState(siteConfig.logoPart1);
  const [logoPart2, setLogoPart2] = useState(siteConfig.logoPart2);
  const [tagline, setTagline] = useState(siteConfig.tagline);
  const [heroHeadline, setHeroHeadline] = useState(siteConfig.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(siteConfig.heroSubheadline);
  const [heroBgColor, setHeroBgColor] = useState(siteConfig.heroBgColor);
  const [manifestoText, setManifestoText] = useState(siteConfig.manifestoText || '');
  const [manifestoAuthor, setManifestoAuthor] = useState(siteConfig.manifestoAuthor || '');
  const [authorName, setAuthorName] = useState(siteConfig.authorName || '');
  const [authorRole, setAuthorRole] = useState(siteConfig.authorRole || '');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState(siteConfig.authorAvatarUrl || '');
  const [aboutMeTitle, setAboutMeTitle] = useState(siteConfig.aboutMeTitle || '');
  const [aboutMeBio, setAboutMeBio] = useState(siteConfig.aboutMeBio || '');
  
  const [themePrimaryColor, setThemePrimaryColor] = useState(siteConfig.themePrimaryColor || '#FFD600');
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(siteConfig.themeSecondaryColor || '#00E0FF');
  const [themeAccentColor, setThemeAccentColor] = useState(siteConfig.themeAccentColor || '#FF60B5');
  const [themeSuccessColor, setThemeSuccessColor] = useState(siteConfig.themeSuccessColor || '#00FF41');
  
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState(siteConfig.footerNewsletterTitle || '');
  const [footerNewsletterSubtitle, setFooterNewsletterSubtitle] = useState(siteConfig.footerNewsletterSubtitle || '');
  const [footerBrandStatement, setFooterBrandStatement] = useState(siteConfig.footerBrandStatement || '');
  
  const [contactTitle, setContactTitle] = useState(siteConfig.contactTitle || '');
  const [contactSubtitle, setContactSubtitle] = useState(siteConfig.contactSubtitle || '');
  const [contactEmail, setContactEmail] = useState(siteConfig.contactEmail || '');
  const [contactTwitter, setContactTwitter] = useState(siteConfig.contactTwitter || '');
  const [contactGithub, setContactGithub] = useState(siteConfig.contactGithub || '');
  const [contactTelegram, setContactTelegram] = useState(siteConfig.contactTelegram || '');
  
  const [backupJson, setBackupJson] = useState('');
  const [showBackupUI, setShowBackupUI] = useState(false);

  const [configSuccess, setConfigSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteConfig({
      logoImageUrl,
      logoPart1,
      logoPart2,
      tagline,
      heroHeadline,
      heroSubheadline,
      heroBgColor,
      manifestoText,
      manifestoAuthor,
      authorName,
      authorRole,
      authorAvatarUrl,
      aboutMeTitle,
      aboutMeBio,
      themePrimaryColor,
      themeSecondaryColor,
      themeAccentColor,
      themeSuccessColor,
      footerNewsletterTitle,
      footerNewsletterSubtitle,
      footerBrandStatement,
      contactTitle,
      contactSubtitle,
      contactEmail,
      contactTwitter,
      contactGithub,
      contactTelegram
    });
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 2000);
  };
  const [projectId, setProjectId] = useState(SANITY_CONFIG.projectId || '');
  const [dataset, setDataset] = useState(SANITY_CONFIG.dataset || 'production');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // New Article Form state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingArticleSlug, setEditingArticleSlug] = useState<string | null>(null);
  const [editingPublishedAt, setEditingPublishedAt] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Web Development');
  const [newTags, setNewTags] = useState('React, Architecture, Frontend');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop');
  const [newCoverAlt, setNewCoverAlt] = useState('Code and architecture display');
  const [newCoverCaption, setNewCoverCaption] = useState('Fig 1 — Production systems blueprint.');
  const [newReadingTime, setNewReadingTime] = useState(6);
  const [newParagraph1, setNewParagraph1] = useState('');
  const [newCodeLanguage, setNewCodeLanguage] = useState('typescript');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Bento Links state
  const [bentoTitle, setBentoTitle] = useState('');
  const [bentoUrl, setBentoUrl] = useState('');
  const [bentoIcon, setBentoIcon] = useState('link');
  const [bentoColor, setBentoColor] = useState('#ffffff');
  const [bentoIsFeatured, setBentoIsFeatured] = useState(false);
  
  const handleAddBentoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bentoTitle.trim() || !bentoUrl.trim()) return;
    
    const newLink: BentoLink = {
      id: `bento-${Date.now()}`,
      title: bentoTitle.trim(),
      url: bentoUrl.trim(),
      icon: bentoIcon,
      color: bentoColor,
      isFeatured: bentoIsFeatured,
      order: bentoLinks.length > 0 ? Math.max(...bentoLinks.map(l => l.order)) + 1 : 1
    };
    
    onUpdateBentoLinks([...bentoLinks, newLink]);
    
    // Reset form
    setBentoTitle('');
    setBentoUrl('');
    setBentoIcon('link');
    setBentoColor('#ffffff');
    setBentoIsFeatured(false);
  };
  
  const handleDeleteBentoLink = (id: string) => {
    onUpdateBentoLinks(bentoLinks.filter(link => link.id !== id));
  };
  
  const handleMoveBentoLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newLinks = [...bentoLinks];
      const temp = newLinks[index].order;
      newLinks[index].order = newLinks[index - 1].order;
      newLinks[index - 1].order = temp;
      onUpdateBentoLinks(newLinks.sort((a, b) => a.order - b.order));
    } else if (direction === 'down' && index < bentoLinks.length - 1) {
      const newLinks = [...bentoLinks];
      const temp = newLinks[index].order;
      newLinks[index].order = newLinks[index + 1].order;
      newLinks[index + 1].order = temp;
      onUpdateBentoLinks(newLinks.sort((a, b) => a.order - b.order));
    }
  };

  if (!isOpen) return null;

  const testConnection = async () => {
    if (!projectId.trim()) {
      setConnectionStatus('error');
      setStatusMessage('Please enter a Sanity Project ID.');
      return;
    }

    setConnectionStatus('checking');
    setStatusMessage('Checking Sanity GROQ endpoint...');

    try {
      const url = `https://${projectId.trim()}.api.sanity.io/v2024-03-01/data/query/${dataset}?query=*[_type == "post"][0..2]`;
      const res = await fetch(url);
      if (res.ok) {
        setConnectionStatus('success');
        setStatusMessage('Successfully connected to Sanity API endpoint!');
      } else {
        setConnectionStatus('error');
        setStatusMessage(`Sanity responded with HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(err?.message || 'Connection failed.');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;

    const slug = editingArticleSlug || newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);

    const article: Article = {
      id: editingArticleId || `custom-${Date.now()}`,
      slug,
      title: newTitle.trim(),
      excerpt: newExcerpt.trim(),
      category: newCategory,
      tags: tagsArray.length ? tagsArray : ['Engineering'],
      publishedAt: editingPublishedAt || new Date().toISOString().split('T')[0],
      readingTimeMinutes: Number(newReadingTime) || 5,
      coverImage: newCoverImage.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      coverImageAlt: newCoverAlt || newTitle,
      coverImageCaption: newCoverCaption,
      featured: false,
      trending: true,
      viewsCount: 1,
      clapsCount: 0,
      author: {
        name: siteConfig.authorName || 'Krish',
        role: siteConfig.authorRole || 'Founder & Software Architect',
        avatar: siteConfig.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        bio: 'Writing about distributed systems, modern web runtimes, and engineering craft.'
      },
      content: [
        {
          type: 'paragraph',
          content: newParagraph1 || newExcerpt
        },
        ...(newCodeSnippet ? [{
          type: 'code' as const,
          codeBlock: {
            language: newCodeLanguage,
            filename: `solution.${newCodeLanguage === 'typescript' ? 'ts' : newCodeLanguage === 'python' ? 'py' : 'txt'}`,
            code: newCodeSnippet
          }
        }] : []),
        ...(newTakeaway ? [{
          type: 'takeaways' as const,
          items: [newTakeaway]
        }] : [])
      ]
    };

    saveCustomLocalArticle(article);
    onArticlePublished(article);
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      resetForm();
    }, 2000);
  };

  const handleEditArticle = (article: Article) => {
    setActiveTab('create');
    setEditingArticleId(article.id);
    setEditingArticleSlug(article.slug);
    setEditingPublishedAt(article.publishedAt);
    setNewTitle(article.title);
    setNewCategory(article.category);
    setNewTags(article.tags?.join(', ') || '');
    setNewExcerpt(article.excerpt);
    setNewCoverImage(article.coverImage || '');
    setNewCoverAlt(article.coverImageAlt || '');
    setNewCoverCaption(article.coverImageCaption || '');
    setNewReadingTime(article.readingTimeMinutes);
    
    // Parse content
    const p1 = article.content?.find(c => c.type === 'paragraph');
    const code = article.content?.find(c => c.type === 'code');
    const takeaways = article.content?.find(c => c.type === 'takeaways');

    setNewParagraph1(p1?.content || '');
    setNewCodeSnippet(code?.codeBlock?.code || '');
    setNewCodeLanguage(code?.codeBlock?.language || 'typescript');
    setNewTakeaway(takeaways?.items?.[0] || '');
  };

  const resetForm = () => {
    setEditingArticleId(null);
    setEditingArticleSlug(null);
    setEditingPublishedAt(null);
    setNewTitle('');
    setNewCategory('Web Development');
    setNewTags('');
    setNewExcerpt('');
    setNewParagraph1('');
    setNewCodeSnippet('');
    setNewTakeaway('');
    setNewCoverImage('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop');
  };

  return (
    <div className="w-full bg-neutral-100 min-h-[calc(100vh-64px)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-white border-4 border-black neo-shadow-lg overflow-hidden my-4 sm:my-8">
        
        {/* Modal Header */}
        <div className="bg-[var(--color-secondary)] px-4 sm:px-6 py-4 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-black stroke-[2.5]" />
            <div>
              <h2 className="font-display font-black text-xl text-black uppercase tracking-tight">
                KRISHFICIENT CMS STUDIO &amp; PUBLISHER
              </h2>
              <div className="font-mono text-[11px] text-black/90 font-bold">
                SANITY CMS INTEGRATION &bull; MOBILE &amp; DESKTOP READY
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black neo-shadow-sm hover:bg-black hover:text-white transition-colors active:translate-x-0.5 active:translate-y-0.5"
            title="Close Admin Studio"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-6 text-center bg-white min-h-[500px]">
            <Shield className="w-16 h-16 text-[var(--color-primary)] stroke-[2]" />
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight mb-2">Authentication Required</h3>
              <p className="font-mono text-sm text-neutral-500">You must be an authorized administrator to access the CMS Engine.</p>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="mt-4 px-8 py-4 bg-[var(--color-primary)] border-4 border-black font-display font-black text-sm uppercase neo-shadow-sm hover:bg-[var(--color-secondary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In with Google'}
            </button>
          </div>
        ) : (
          <div className="bg-white min-h-[600px] flex flex-col">

        {/* Tab Selector */}
        <div className="grid grid-cols-5 border-b-4 border-black font-display font-black text-[10px] sm:text-xs uppercase bg-white">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1.5 transition-colors ${
              activeTab === 'settings' ? 'bg-[var(--color-primary)] text-black border-r-2 border-black' : 'hover:bg-neutral-100 border-r-2 border-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1.5 transition-colors ${
              activeTab === 'create' ? 'bg-[var(--color-primary)] text-black border-r-2 border-black' : 'hover:bg-neutral-100 border-r-2 border-black'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">CREATE</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1.5 transition-colors ${
              activeTab === 'manage' ? 'bg-[var(--color-primary)] text-black border-r-2 border-black' : 'hover:bg-neutral-100 border-r-2 border-black'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">MANAGE</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1.5 transition-colors ${
              activeTab === 'links' ? 'bg-[var(--color-primary)] text-black border-r-2 border-black' : 'hover:bg-neutral-100 border-r-2 border-black'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">LINKS</span>
          </button>

          <button
            onClick={() => setActiveTab('sanity')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1.5 transition-colors ${
              activeTab === 'sanity' ? 'bg-[var(--color-primary)] text-black' : 'hover:bg-neutral-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">SANITY</span>
          </button>
        </div>

        {/* Tab 1: Quick Article Creator */}
        {activeTab === 'create' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="bg-[var(--color-primary)]/30 p-3.5 neo-border-2 font-sans text-xs text-black space-y-1">
              <div className="font-display font-black text-sm uppercase flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-black" />
                <span>MOBILE-READY CMS PUBLISHING</span>
              </div>
              <p>
                Write and publish new technical articles on the fly from your phone or desktop. Articles publish instantly to KRISHFICIENT without redeploying code.
              </p>
            </div>

            {publishSuccess ? (
              <div className="py-12 text-center bg-white neo-border p-8 space-y-3">
                <div className="w-12 h-12 bg-[var(--color-success)] neo-border-2 flex items-center justify-center mx-auto neo-shadow-sm">
                  <Check className="w-6 h-6 text-black stroke-[3]" />
                </div>
                <h3 className="font-display font-black text-2xl uppercase text-black">ARTICLE PUBLISHED!</h3>
                <p className="font-sans text-sm text-neutral-600">
                  Your new dispatch is now live on KRISHFICIENT.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus in Modern Rust Microservices"
                    className="w-full px-3.5 py-2.5 border-2 border-black font-display font-bold text-base focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black font-display font-bold text-sm bg-white focus:outline-none"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Developer Tools">Developer Tools</option>
                      <option value="System Design">System Design</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Rust, Systems, Concurrency"
                      className="w-full px-3.5 py-2.5 border-2 border-black font-sans text-sm focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    Excerpt / Editorial Abstract *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="A punchy 2-sentence summary that appears on cards and social previews..."
                    className="w-full p-3 border-2 border-black font-sans text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={newCoverImage}
                      onChange={(e) => setNewCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">
                      Est. Reading Time (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={newReadingTime}
                      onChange={(e) => setNewReadingTime(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-black font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    Main Content Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={newParagraph1}
                    onChange={(e) => setNewParagraph1(e.target.value)}
                    placeholder="Write the opening thoughts, architectural breakdown, and rationale..."
                    className="w-full p-3 border-2 border-black font-sans text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-xs font-bold uppercase text-black">
                      Optional Code Snippet
                    </label>
                    <select
                      value={newCodeLanguage}
                      onChange={(e) => setNewCodeLanguage(e.target.value)}
                      className="text-xs font-mono border border-black px-2 py-0.5 bg-white"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="rust">Rust</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash</option>
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    value={newCodeSnippet}
                    onChange={(e) => setNewCodeSnippet(e.target.value)}
                    placeholder="// Paste your production code snippet here"
                    className="w-full p-3 border-2 border-black font-mono text-xs bg-[#0F172A] text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    Key Architectural Takeaway
                  </label>
                  <input
                    type="text"
                    value={newTakeaway}
                    onChange={(e) => setNewTakeaway(e.target.value)}
                    placeholder="e.g. Always benchmark query latency before choosing an LSM storage engine."
                    className="w-full px-3.5 py-2.5 border-2 border-black font-sans text-sm focus:outline-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[var(--color-success)] text-black font-display font-black text-sm uppercase neo-border neo-shadow-sm hover:bg-[var(--color-primary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{editingArticleId ? 'UPDATE ESSAY' : 'PUBLISH ESSAY IMMEDIATELY'}</span>
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  {editingArticleId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3.5 bg-neutral-200 text-black font-display font-black text-sm uppercase neo-border neo-shadow-sm hover:bg-neutral-300 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="bg-[var(--color-secondary)]/30 p-3.5 neo-border-2 font-sans text-xs text-black space-y-1">
              <div className="font-display font-black text-sm uppercase flex items-center space-x-1.5">
                <Settings className="w-4 h-4 text-black" />
                <span>GLOBAL SITE CONFIGURATION</span>
              </div>
              <p>Update site logos, branding, and the homepage hero section.</p>
            </div>

            {configSuccess && (
              <div className="p-3 bg-[var(--color-success)] border-2 border-black font-mono text-xs font-bold flex items-center space-x-2 neo-shadow-sm">
                <Check className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* BRANDING SECTION */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Branding</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Logo Image URL (Optional)</label>
                  <input type="text" value={logoImageUrl} onChange={(e) => setLogoImageUrl(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Logo Part 1</label>
                    <input type="text" value={logoPart1} onChange={(e) => setLogoPart1(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Logo Part 2 (Accent)</label>
                    <input type="text" value={logoPart2} onChange={(e) => setLogoPart2(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none text-[var(--color-accent)]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Tagline</label>
                  <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
              </div>

              {/* HERO SECTION */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Hero Section</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Hero Headline</label>
                  <textarea rows={2} value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-display font-bold text-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Hero Subheadline</label>
                  <textarea rows={3} value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-sans text-sm focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Hero Background Color (Hex)</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className="w-10 h-10 border-2 border-black p-0.5 cursor-pointer" />
                    <input type="text" value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className="flex-1 px-3 py-2 border-2 border-black font-mono focus:outline-none uppercase" />
                  </div>
                </div>
              </div>

              {/* MANIFESTO SECTION */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Terminal Manifesto</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Manifesto Text</label>
                  <textarea rows={3} value={manifestoText} onChange={(e) => setManifestoText(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-serif text-sm focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Manifesto Author</label>
                  <input type="text" value={manifestoAuthor} onChange={(e) => setManifestoAuthor(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
              </div>

              {/* ABOUT SECTION */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">About Me Page</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">About Section Title</label>
                  <input type="text" value={aboutMeTitle} onChange={(e) => setAboutMeTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Author Name</label>
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Author Role</label>
                    <input type="text" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Author Avatar URL</label>
                  <input type="text" value={authorAvatarUrl} onChange={(e) => setAuthorAvatarUrl(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">About Me Bio (Use double line breaks for paragraphs)</label>
                  <textarea rows={6} value={aboutMeBio} onChange={(e) => setAboutMeBio(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-serif text-sm focus:outline-none" />
                </div>
              </div>

              {/* COLORS SECTION */}
              <div className="space-y-4 pt-4 border-t-2 border-black">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Site Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Primary (Yellow)</label>
                    <input type="text" value={themePrimaryColor} onChange={(e) => setThemePrimaryColor(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Secondary (Cyan)</label>
                    <input type="text" value={themeSecondaryColor} onChange={(e) => setThemeSecondaryColor(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Accent (Pink)</label>
                    <input type="text" value={themeAccentColor} onChange={(e) => setThemeAccentColor(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Success (Green)</label>
                    <input type="text" value={themeSuccessColor} onChange={(e) => setThemeSuccessColor(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* FOOTER SECTION */}
              <div className="space-y-4 pt-4 border-t-2 border-black">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Footer Settings</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Newsletter Title</label>
                  <input type="text" value={footerNewsletterTitle} onChange={(e) => setFooterNewsletterTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Newsletter Subtitle</label>
                  <input type="text" value={footerNewsletterSubtitle} onChange={(e) => setFooterNewsletterSubtitle(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Brand Statement</label>
                  <textarea rows={3} value={footerBrandStatement} onChange={(e) => setFooterBrandStatement(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
              </div>

              {/* CONTACT SECTION */}
              <div className="space-y-4 pt-4 border-t-2 border-black">
                <h4 className="font-display font-black text-lg uppercase border-b-2 border-black pb-1">Contact Page</h4>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Title</label>
                  <input type="text" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase text-black">Subtitle</label>
                  <input type="text" value={contactSubtitle} onChange={(e) => setContactSubtitle(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Email</label>
                    <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Twitter/X</label>
                    <input type="text" value={contactTwitter} onChange={(e) => setContactTwitter(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">GitHub</label>
                    <input type="text" value={contactGithub} onChange={(e) => setContactGithub(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold uppercase text-black">Telegram</label>
                    <input type="text" value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* BACKUP / RESTORE SECTION */}
              <div className="space-y-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-black text-lg uppercase">Backup & Restore</h4>
                  <button type="button" onClick={() => {
                      if (!showBackupUI) {
                        setBackupJson(JSON.stringify({
                          logoImageUrl, logoPart1, logoPart2, tagline, heroHeadline, heroSubheadline, heroBgColor,
                          manifestoText, manifestoAuthor, authorName, authorRole, authorAvatarUrl, aboutMeTitle, aboutMeBio,
                          themePrimaryColor, themeSecondaryColor, themeAccentColor, themeSuccessColor,
                          footerNewsletterTitle, footerNewsletterSubtitle, footerBrandStatement,
                          contactTitle, contactSubtitle, contactEmail, contactTwitter, contactGithub, contactTelegram
                        }, null, 2));
                      }
                      setShowBackupUI(!showBackupUI);
                    }} className="text-xs font-mono font-bold bg-neutral-200 px-2 py-1 border-2 border-black">
                    {showBackupUI ? 'HIDE' : 'SHOW JSON'}
                  </button>
                </div>
                {showBackupUI && (
                  <div className="space-y-2 bg-neutral-50 p-4 border-2 border-black">
                    <p className="font-mono text-[10px] text-neutral-600 mb-2 leading-relaxed">
                      Copy the JSON below to backup your settings, or paste a previously saved JSON configuration and click "Import Configuration" to load it.
                    </p>
                    <textarea
                      rows={8}
                      value={backupJson}
                      onChange={(e) => setBackupJson(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black font-mono text-[10px] focus:outline-none"
                      placeholder="Paste configuration JSON here..."
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <button type="button" onClick={() => {
                          navigator.clipboard.writeText(backupJson);
                          alert('Copied settings to clipboard!');
                      }} className="flex-1 py-2 bg-black text-white font-display font-bold text-xs uppercase border-2 border-black hover:bg-neutral-800 transition-colors">
                        Copy to Clipboard
                      </button>
                      <button type="button" onClick={() => {
                          try {
                            const parsed = JSON.parse(backupJson);
                            if (parsed.logoImageUrl !== undefined) setLogoImageUrl(parsed.logoImageUrl);
                            if (parsed.logoPart1 !== undefined) setLogoPart1(parsed.logoPart1);
                            if (parsed.logoPart2 !== undefined) setLogoPart2(parsed.logoPart2);
                            if (parsed.tagline !== undefined) setTagline(parsed.tagline);
                            if (parsed.heroHeadline !== undefined) setHeroHeadline(parsed.heroHeadline);
                            if (parsed.heroSubheadline !== undefined) setHeroSubheadline(parsed.heroSubheadline);
                            if (parsed.heroBgColor !== undefined) setHeroBgColor(parsed.heroBgColor);
                            if (parsed.manifestoText !== undefined) setManifestoText(parsed.manifestoText);
                            if (parsed.manifestoAuthor !== undefined) setManifestoAuthor(parsed.manifestoAuthor);
                            if (parsed.authorName !== undefined) setAuthorName(parsed.authorName);
                            if (parsed.authorRole !== undefined) setAuthorRole(parsed.authorRole);
                            if (parsed.authorAvatarUrl !== undefined) setAuthorAvatarUrl(parsed.authorAvatarUrl);
                            if (parsed.aboutMeTitle !== undefined) setAboutMeTitle(parsed.aboutMeTitle);
                            if (parsed.aboutMeBio !== undefined) setAboutMeBio(parsed.aboutMeBio);
                            if (parsed.themePrimaryColor !== undefined) setThemePrimaryColor(parsed.themePrimaryColor);
                            if (parsed.themeSecondaryColor !== undefined) setThemeSecondaryColor(parsed.themeSecondaryColor);
                            if (parsed.themeAccentColor !== undefined) setThemeAccentColor(parsed.themeAccentColor);
                            if (parsed.themeSuccessColor !== undefined) setThemeSuccessColor(parsed.themeSuccessColor);
                            if (parsed.footerNewsletterTitle !== undefined) setFooterNewsletterTitle(parsed.footerNewsletterTitle);
                            if (parsed.footerNewsletterSubtitle !== undefined) setFooterNewsletterSubtitle(parsed.footerNewsletterSubtitle);
                            if (parsed.footerBrandStatement !== undefined) setFooterBrandStatement(parsed.footerBrandStatement);
                            if (parsed.contactTitle !== undefined) setContactTitle(parsed.contactTitle);
                            if (parsed.contactSubtitle !== undefined) setContactSubtitle(parsed.contactSubtitle);
                            if (parsed.contactEmail !== undefined) setContactEmail(parsed.contactEmail);
                            if (parsed.contactTwitter !== undefined) setContactTwitter(parsed.contactTwitter);
                            if (parsed.contactGithub !== undefined) setContactGithub(parsed.contactGithub);
                            if (parsed.contactTelegram !== undefined) setContactTelegram(parsed.contactTelegram);
                            alert('Configuration imported! Scroll down and click "SAVE SETTINGS" to apply them globally.');
                          } catch (e) {
                            alert('Invalid JSON format. Please check the structure and try again.');
                          }
                      }} className="flex-1 py-2 bg-[var(--color-primary)] text-black font-display font-black text-xs uppercase border-2 border-black hover:bg-[var(--color-secondary)] transition-colors">
                        Import Configuration
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--color-secondary)] text-black font-display font-black text-sm uppercase neo-border neo-shadow-sm hover:bg-[var(--color-primary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2 mt-6"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>SAVE SETTINGS</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab: Manage Posts */}
        {activeTab === 'manage' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <h3 className="font-display font-black text-xl uppercase border-b-4 border-black pb-2 mb-4">
              MANAGE POSTS
            </h3>
            {articles.length === 0 ? (
              <p className="font-mono text-xs text-neutral-500">No articles available.</p>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border-2 border-black neo-shadow-sm bg-white">
                    <div className="flex-1 truncate pr-4">
                      <div className="font-bold text-sm truncate">{article.title}</div>
                      <div className="font-mono text-[10px] text-neutral-500">{article.category} &bull; {article.publishedAt}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="p-2 bg-[var(--color-primary)] hover:bg-black hover:text-white border-2 border-black neo-shadow-sm transition-colors active:translate-x-0.5 active:translate-y-0.5"
                        title="Edit Article"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteArticle(article.slug)}
                        className="p-2 bg-[var(--color-accent)] hover:bg-black hover:text-white border-2 border-black neo-shadow-sm transition-colors active:translate-x-0.5 active:translate-y-0.5"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Bento Links */}
        {activeTab === 'links' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="bg-[var(--color-success)]/30 p-3.5 neo-border-2 font-sans text-xs text-black space-y-1">
              <div className="font-display font-black text-sm uppercase flex items-center space-x-1.5">
                <LinkIcon className="w-4 h-4 text-black" />
                <span>MY LINKS (BENTO BOX)</span>
              </div>
              <p>Manage promotional links, social profiles, and featured content.</p>
            </div>

            <form onSubmit={handleAddBentoLink} className="space-y-4 bg-neutral-50 p-4 border-2 border-black neo-shadow-sm">
              <h4 className="font-display font-black text-sm uppercase">Add New Link</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">Title</label>
                  <input type="text" value={bentoTitle} onChange={e => setBentoTitle(e.target.value)} placeholder="e.g. Follow on X" className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">URL</label>
                  <input type="text" value={bentoUrl} onChange={e => setBentoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border-2 border-black font-mono text-xs focus:outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">Icon</label>
                  <select value={bentoIcon} onChange={e => setBentoIcon(e.target.value)} className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none bg-white">
                    <option value="link">Link (Default)</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="github">GitHub</option>
                    <option value="youtube">YouTube</option>
                    <option value="music">Music / Spotify</option>
                    <option value="globe">Globe / Website</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs font-bold uppercase">Color (Hex)</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={bentoColor} onChange={e => setBentoColor(e.target.value)} className="w-10 h-10 border-2 border-black p-0.5 cursor-pointer" />
                    <input type="text" value={bentoColor} onChange={e => setBentoColor(e.target.value)} className="flex-1 px-3 py-2 border-2 border-black font-mono uppercase focus:outline-none text-xs" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="isFeatured" checked={bentoIsFeatured} onChange={e => setBentoIsFeatured(e.target.checked)} className="w-4 h-4 border-2 border-black accent-[var(--color-primary)]" />
                <label htmlFor="isFeatured" className="font-mono text-xs font-bold uppercase cursor-pointer">Featured Link (Larger Display)</label>
              </div>

              <button type="submit" className="w-full py-2 bg-[var(--color-success)] border-2 border-black font-display font-black text-sm uppercase hover:bg-black hover:text-[var(--color-success)] transition-colors">
                ADD LINK
              </button>
            </form>

            <div className="space-y-3 pt-2 border-t-2 border-black">
              <h4 className="font-display font-black text-sm uppercase mb-2">Current Links</h4>
              {[...bentoLinks].sort((a, b) => a.order - b.order).map((link, index, arr) => (
                <div key={link.id} className="flex items-center justify-between p-3 border-2 border-black bg-white neo-shadow-sm">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: link.color }} />
                    <div className="flex-1 truncate">
                      <div className="font-bold text-sm truncate flex items-center space-x-2">
                        <span>{link.title}</span>
                        {link.isFeatured && <span className="bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-mono border border-black uppercase">Featured</span>}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-500 truncate">{link.url}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1.5 ml-2">
                    <button
                      onClick={() => handleMoveBentoLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 border-2 border-black hover:bg-neutral-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveBentoLink(index, 'down')}
                      disabled={index === arr.length - 1}
                      className="p-1.5 border-2 border-black hover:bg-neutral-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBentoLink(link.id)}
                      className="p-1.5 bg-[var(--color-accent)] border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {bentoLinks.length === 0 && (
                <p className="font-mono text-xs text-neutral-500">No links added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Sanity Cloud Configuration */}
        {activeTab === 'sanity' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="bg-white neo-border-2 p-4 space-y-2">
              <h3 className="font-display font-black text-base uppercase text-black">
                CONNECT TO HOSTED SANITY.IO
              </h3>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                Connect your live Sanity project by entering your Project ID and dataset below.
                The app will automatically query your Sanity GROQ API and fall back to local content if unavailable.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-xs font-bold uppercase text-black">
                  Sanity Project ID
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. 9b8x21a0"
                  className="w-full px-3.5 py-2.5 border-2 border-black font-mono text-sm bg-white"
                />
                <span className="font-mono text-[11px] text-neutral-500">
                  Found in your sanity.io/manage project dashboard
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs font-bold uppercase text-black">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  placeholder="production"
                  className="w-full px-3.5 py-2.5 border-2 border-black font-mono text-sm bg-white"
                />
              </div>

              <button
                onClick={testConnection}
                className="px-6 py-2.5 bg-[var(--color-primary)] text-black font-display font-black text-xs uppercase neo-border neo-shadow-sm hover:bg-[var(--color-secondary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center space-x-2"
              >
                <span>TEST CONNECTION</span>
              </button>

              {connectionStatus !== 'idle' && (
                <div className={`p-4 border-2 border-black font-mono text-xs font-bold ${
                  connectionStatus === 'success' ? 'bg-[var(--color-success)] text-black' :
                  connectionStatus === 'checking' ? 'bg-[var(--color-secondary)] text-black' : 'bg-[var(--color-accent)] text-black'
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-black space-y-2">
              <h4 className="font-display font-black text-sm uppercase text-black">
                HOW TO DEPLOY SANITY STUDIO:
              </h4>
              <ol className="list-decimal list-inside font-mono text-xs text-neutral-800 space-y-1.5 bg-neutral-100 p-3 border-2 border-black">
                <li>Run <code>npm create sanity@latest</code> or use the included <code>sanity/</code> folder.</li>
                <li>Copy <code>sanity/schemaTypes/post.ts</code> to your Sanity Studio schema.</li>
                <li>Run <code>npx sanity deploy</code> to get your mobile CMS URL (e.g., <code>krishficient.sanity.studio</code>).</li>
                <li>Add your Project ID in <code>.env</code> or this configuration tab!</li>
              </ol>
            </div>
          </div>
        )}
        
        </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-100 border-t-4 border-black flex items-center justify-between text-xs font-mono text-neutral-600">
          <span>KRISHFICIENT CMS ENGINE</span>
          <button
            onClick={onClose}
            className="font-bold text-black hover:underline uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

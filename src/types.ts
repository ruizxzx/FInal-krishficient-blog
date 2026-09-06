export type Category = 
  | 'Web Development'
  | 'Artificial Intelligence'
  | 'Software Engineering'
  | 'Computer Science'
  | 'Developer Tools'
  | 'System Design';

export interface CodeSnippet {
  language: string;
  code: string;
  filename?: string;
}

export interface ArticleContentBlock {
  type: 'paragraph' | 'heading2' | 'heading3' | 'callout' | 'quote' | 'code' | 'image' | 'list' | 'takeaways';
  content?: string;
  items?: string[];
  calloutType?: 'info' | 'warning' | 'tip' | 'insight';
  calloutTitle?: string;
  codeBlock?: CodeSnippet;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  quoteAuthor?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageCaption?: string;
  category: Category;
  tags: string[];
  publishedAt: string;
  readingTimeMinutes: number;
  featured?: boolean;
  trending?: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  content: ArticleContentBlock[];
  viewsCount?: number;
  clapsCount?: number;
}

export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn: boolean;
}

export interface SiteConfig {
  logoImageUrl: string;
  logoPart1: string;
  logoPart2: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroBgColor: string;
  manifestoText: string;
  manifestoAuthor: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl: string;
  aboutMeTitle: string;
  aboutMeBio: string;
  
  // Advanced Global Settings
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  themeSuccessColor?: string;
  
  // Footer
  footerNewsletterTitle?: string;
  footerNewsletterSubtitle?: string;
  footerBrandStatement?: string;
  footerLegalText?: string;
  
  // Contact Page
  contactTitle?: string;
  contactSubtitle?: string;
  contactEmail?: string;
  contactTwitter?: string;
  contactGithub?: string;
  contactTelegram?: string;
  
  // Extra Info
  aboutMeImageUrl?: string;
}

export interface BentoLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  isFeatured: boolean;
  color: string;
  order: number;
}

export type PageView = 'home' | 'blog' | 'article' | 'about' | 'contact' | 'cms' | 'links';

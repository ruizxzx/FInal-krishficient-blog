import { Article } from '../types';
import { INITIAL_ARTICLES } from '../data/articles';

// Default configuration for Sanity
export const SANITY_CONFIG = {
  projectId: (import.meta as any).env?.VITE_SANITY_PROJECT_ID || '',
  dataset: (import.meta as any).env?.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-03-01',
  useCdn: true,
};

// Key for local browser storage when user tests or creates posts before hooking up live Sanity
const LOCAL_POSTS_KEY = 'krishficient_custom_articles_v1';

export function getCustomLocalArticles(): Article[] {
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read custom local articles:', err);
    return [];
  }
}

export function saveCustomLocalArticle(article: Article): void {
  try {
    const existing = getCustomLocalArticles();
    const filtered = existing.filter(a => a.slug !== article.slug);
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify([article, ...filtered]));
  } catch (err) {
    console.error('Could not save custom article:', err);
  }
}

export function deleteCustomLocalArticle(slug: string): void {
  try {
    const existing = getCustomLocalArticles();
    const filtered = existing.filter(a => a.slug !== slug);
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Could not delete custom article:', err);
  }
}

// GROQ query to fetch all published posts from Sanity
export const POSTS_QUERY = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  category,
  tags,
  excerpt,
  "coverImage": coverImage.asset->url,
  "coverImageAlt": coverImage.alt,
  "coverImageCaption": coverImage.caption,
  readingTimeMinutes,
  featured,
  trending,
  body
}`;

/**
 * Transforms Sanity document format into our frontend Article format
 */
export function transformSanityPost(doc: any): Article {
  return {
    id: doc._id || doc.slug,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt || 'Read more in this in-depth technical analysis on KRISHFICIENT.',
    coverImage: doc.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    coverImageAlt: doc.coverImageAlt || doc.title,
    coverImageCaption: doc.coverImageCaption || '',
    category: doc.category || 'Software Engineering',
    tags: doc.tags || ['Technology'],
    publishedAt: doc.publishedAt ? doc.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    readingTimeMinutes: doc.readingTimeMinutes || 6,
    featured: doc.featured || false,
    trending: doc.trending || false,
    viewsCount: 1200,
    clapsCount: 45,
    author: {
      name: 'Krish',
      role: 'Founder & Software Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      bio: 'Writing about distributed systems, modern web runtimes, and engineering craft at KRISHFICIENT.'
    },
    content: Array.isArray(doc.body) ? doc.body.map((block: any) => {
      if (block._type === 'block') {
        const text = block.children?.map((c: any) => c.text).join('') || '';
        if (block.style === 'h2') return { type: 'heading2', content: text };
        if (block.style === 'h3') return { type: 'heading3', content: text };
        if (block.style === 'blockquote') return { type: 'quote', content: text };
        return { type: 'paragraph', content: text };
      }
      if (block._type === 'code') {
        return {
          type: 'code',
          codeBlock: {
            language: block.language || 'typescript',
            filename: block.filename || 'snippet.ts',
            code: block.code || ''
          }
        };
      }
      return { type: 'paragraph', content: JSON.stringify(block) };
    }) : [
      {
        type: 'paragraph',
        content: typeof doc.body === 'string' ? doc.body : 'Article content loading...'
      }
    ]
  };
}

/**
 * Fetch all articles from Sanity CMS with automatic fallback to local high-fidelity articles
 */
export async function fetchArticles(configOverride?: { projectId: string; dataset: string }): Promise<{
  articles: Article[];
  source: 'sanity' | 'local';
  error?: string;
}> {
  const projectId = configOverride?.projectId || SANITY_CONFIG.projectId;
  const dataset = configOverride?.dataset || SANITY_CONFIG.dataset;

  // Combine initial curated articles + locally created articles
  const customLocal = getCustomLocalArticles();
  const localCombined = [...customLocal, ...INITIAL_ARTICLES];

  if (!projectId) {
    return {
      articles: localCombined,
      source: 'local'
    };
  }

  try {
    const encodedQuery = encodeURIComponent(POSTS_QUERY);
    const url = `https://${projectId}.api.sanity.io/v2024-03-01/data/query/${dataset}?query=${encodedQuery}`;
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Sanity API error HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.result) && data.result.length > 0) {
      const sanityArticles = data.result.map(transformSanityPost);
      return {
        articles: [...customLocal, ...sanityArticles],
        source: 'sanity'
      };
    } else {
      // Empty Sanity dataset, use fallback
      return {
        articles: localCombined,
        source: 'local',
        error: 'Sanity dataset returned 0 posts. Showing local publications.'
      };
    }
  } catch (err: any) {
    console.warn('Sanity query failed, falling back to local articles:', err?.message);
    return {
      articles: localCombined,
      source: 'local',
      error: err?.message || 'Connection error'
    };
  }
}

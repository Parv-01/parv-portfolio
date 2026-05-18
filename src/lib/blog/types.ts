/**
 * Unified post shape that normalizes local MDX posts and external posts
 * (Hashnode, Dev.to, Medium) into a single type the Blog page can render.
 */

export type UnifiedPostSource = 'local' | 'hashnode' | 'devto' | 'medium';

export type UnifiedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  source: UnifiedPostSource;
  href: string;
  external: boolean;
  paywalled?: boolean;
  platformLabel?: string;
};

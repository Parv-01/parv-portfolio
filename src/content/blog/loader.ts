import type { ComponentType } from 'react';
import type { UnifiedPost } from '@/lib/blog/types';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  Component: ComponentType;
};

const modules = import.meta.glob<{
  default: ComponentType;
  frontmatter: Omit<BlogPost, 'slug' | 'Component'>;
}>('./*.mdx', { eager: true });

function slugFromPath(path: string): string {
  return path.replace(/^\.\//, '').replace(/\.mdx$/, '');
}

const POSTS: BlogPost[] = Object.entries(modules)
  .map(([path, mod]) => {
    const fm = mod.frontmatter ?? ({} as BlogPost);
    return {
      slug: slugFromPath(path),
      title: fm.title ?? 'Untitled',
      excerpt: fm.excerpt ?? '',
      date: fm.date ?? '',
      readTime: fm.readTime ?? '5 min',
      tags: fm.tags ?? [],
      featured: fm.featured ?? false,
      Component: mod.default,
    } satisfies BlogPost;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function loadPosts(): BlogPost[] {
  return POSTS;
}

export function findPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function loadLocalUnified(): UnifiedPost[] {
  return loadPosts().map((p) => ({
    id: 'local:' + p.slug,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readTime: p.readTime,
    tags: p.tags.map((t) => t.trim()).filter(Boolean),
    featured: p.featured,
    source: 'local',
    href: '/blog/' + p.slug,
    external: false,
  }));
}

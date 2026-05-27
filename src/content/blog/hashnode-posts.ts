/**
 * Hashnode posts — manually maintained list.
 *
 * Why this file exists: as of 2026-05-13 Hashnode retired free GraphQL API
 * access (now Pro-only) and their RSS feeds sit behind Cloudflare's bot
 * challenge, so we can't fetch them at runtime from the browser. Until you
 * either upgrade to Hashnode Pro or move off the platform, edit this file
 * whenever you publish a new Hashnode post and the blog page will pick it up
 * on the next deploy.
 *
 * Date format: YYYY-MM-DD or full ISO-8601. Posts are merged into the
 * unified blog list and sorted newest-first along with local MDX, Dev.to,
 * and Medium posts.
 */

export type HashnodePostEntry = {
  id: string;          // unique id, e.g. the URL slug
  title: string;
  excerpt: string;
  date: string;        // YYYY-MM-DD
  readTime: string;    // e.g. "8 min"
  tags: string[];      // lowercased recommended for clean filtering
  url: string;         // full URL to the Hashnode post
  paywalled?: boolean; // for symmetry with Medium; usually false on Hashnode
};

export const HASHNODE_POSTS: HashnodePostEntry[] = [
  // Example entry — replace with your real posts:
  // {
  //   id: 'why-i-finally-stopped-fighting-pytorch-lightning',
  //   title: 'Why I Finally Stopped Fighting PyTorch Lightning',
  //   excerpt: 'Three months of resisting the abstraction, and what changed my mind.',
  //   date: '2026-05-20',
  //   readTime: '7 min',
  //   tags: ['pytorch', 'ml', 'tooling'],
  //   url: 'https://parvagarwal.hashnode.dev/why-i-finally-stopped-fighting-pytorch-lightning',
  // },
];

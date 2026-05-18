declare module '*.mdx' {
  import type { ComponentType } from 'react';
  export const frontmatter: {
    title?: string;
    excerpt?: string;
    date?: string;
    readTime?: string;
    tags?: string[];
    featured?: boolean;
  };
  const MDXComponent: ComponentType;
  export default MDXComponent;
}

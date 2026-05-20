import { Link, useParams } from 'react-router';
import { ArrowLeft, Clock } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { findPost } from '@/content/blog/loader';
import { ReadingProgress } from '../components/system/ReadingProgress';
import { NotFound } from './NotFound';
import { SEO } from '../components/system/SEO';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? findPost(slug) : undefined;
  if (!post) return <NotFound />;

  const PostBody = post.Component;

  return (
    <Section padding="default">
      <SEO
        title={`${post.title} | Parv Agarwal`}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
      />
      <ReadingProgress />

      <article className="max-w-[720px] mx-auto flex flex-col gap-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 no-underline transition-colors duration-200"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--fg-muted)' }}
        >
          <ArrowLeft size={12} /> back to all posts
        </Link>

        <div className="flex items-center flex-wrap gap-3">
          <span
            className="uppercase tracking-[0.2em]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--accent)',
            }}
          >
            {post.tags[0] ?? 'Note'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>{post.date}</span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}
          >
            <Clock size={12} /> {post.readTime}
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: 'var(--fg-primary)',
          }}
        >
          {post.title}
        </h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--fg-secondary)' }}>
          {post.excerpt}
        </p>

        <div className="h-px my-4" style={{ background: 'var(--border-hairline)' }} />

        <div className="post-prose">
          <PostBody />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-6">
          {post.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                background: 'var(--bg-chip)',
                color: 'var(--fg-muted)',
                border: '1px solid var(--border-hairline)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </article>
    </Section>
  );
}

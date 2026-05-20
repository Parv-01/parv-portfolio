import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  imagePath?: string;
};

const SITE_ORIGIN = 'https://parvagarwal.is-a.dev';
const DEFAULT_IMAGE_PATH = '/images/og.png';

function upsertMetaByName(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEO({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  imagePath,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = canonicalPath
      ? new URL(canonicalPath, SITE_ORIGIN).toString()
      : SITE_ORIGIN + window.location.pathname;

    const imageUrl = new URL(imagePath ?? DEFAULT_IMAGE_PATH, SITE_ORIGIN).toString();

    document.title = title;
    if (description) upsertMetaByName('description', description);

    upsertCanonical(canonicalUrl);

    upsertMetaByProperty('og:type', ogType);
    upsertMetaByProperty('og:title', title);
    if (description) upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:url', canonicalUrl);
    upsertMetaByProperty('og:image', imageUrl);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', title);
    if (description) upsertMetaByName('twitter:description', description);
    upsertMetaByName('twitter:image', imageUrl);
  }, [title, description, canonicalPath, ogType, imagePath]);

  return null;
}

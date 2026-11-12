import { useEffect } from 'react';

export interface RouteSeoConfig {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
}

function upsertMetaByName(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let el = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaByName(name: string) {
  const el = document.head.querySelector(`meta[name="${name}"]`);
  if (el) {
    el.remove();
  }
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useRouteSeo({ title, description, canonical, noindex }: RouteSeoConfig) {
  useEffect(() => {
    document.title = title;
    upsertMetaByName('description', description);
    upsertCanonical(canonical);
    upsertMetaByProperty('og:title', title);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:url', canonical);
    upsertMetaByName('twitter:title', title);
    upsertMetaByName('twitter:description', description);

    if (noindex) {
      upsertMetaByName('robots', 'noindex');
    } else {
      removeMetaByName('robots');
    }
  }, [title, description, canonical, noindex]);
}

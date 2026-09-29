import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BRAND } from '../config/brand.config';
import { SeoMetaBuilder, type SeoMeta } from '../builders/seo-meta.builder';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  /** Convenience factory that pre-fills brand defaults. */
  createBuilder(): SeoMetaBuilder {
    return new SeoMetaBuilder()
      .canonical(`${BRAND.url}${this.router.url}`)
      .ogImage(BRAND.ogImage, BRAND.name);
  }

  apply(seoMeta: SeoMeta): void {
    const fullTitle = seoMeta.title.includes(BRAND.name)
      ? seoMeta.title
      : `${seoMeta.title} | ${BRAND.name}`;

    this.title.setTitle(fullTitle);

    this.setTag('description', seoMeta.description);
    if (seoMeta.noIndex) {
      this.setTag('robots', 'noindex, nofollow');
    } else {
      this.meta.removeTag('name="robots"');
    }

    // Open Graph
    this.setProperty('og:title', seoMeta.ogTitle);
    this.setProperty('og:description', seoMeta.ogDescription);
    this.setProperty('og:type', seoMeta.ogType);
    this.setProperty('og:url', seoMeta.canonical);
    this.setProperty('og:image', seoMeta.ogImage.url);
    this.setProperty('og:image:alt', seoMeta.ogImage.alt);
    if (seoMeta.ogImage.width)  this.setProperty('og:image:width',  String(seoMeta.ogImage.width));
    if (seoMeta.ogImage.height) this.setProperty('og:image:height', String(seoMeta.ogImage.height));
    this.setProperty('og:site_name', BRAND.name);

    // Twitter Card
    this.setTag('twitter:card', seoMeta.twitterCard);
    this.setTag('twitter:site', BRAND.twitterHandle);
    this.setTag('twitter:title', seoMeta.twitterTitle);
    this.setTag('twitter:description', seoMeta.twitterDescription);
    this.setTag('twitter:image', seoMeta.twitterImage);

    // Canonical link
    this.setCanonical(seoMeta.canonical);

    // JSON-LD structured data
    this.setJsonLd(seoMeta.jsonLd);
  }

  // ──────────────────────────────────────────────────────────────────────────

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(schema?: Record<string, unknown>): void {
    const existing = this.doc.getElementById('json-ld-schema');
    if (existing) existing.remove();

    if (!schema) return;

    const script = this.doc.createElement('script');
    script.id = 'json-ld-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }
}

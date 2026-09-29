/**
 * PATTERN: Builder (GoF Creational)
 *
 * Problem: Constructing an SEO metadata object for different page types
 * (home, catalog, product detail) requires many optional fields, and creating
 * them inline spreads knowledge about valid field combinations across pages.
 *
 * Solution: SeoMetaBuilder provides a fluent API. Each page calls only the
 * methods it needs; build() assembles the validated, complete object.
 * The SeoService receives a SeoMeta value object and applies it — decoupled
 * from how it was constructed.
 */

export interface OgImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface JsonLdSchema {
  [key: string]: unknown;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: OgImage;
  ogType: 'website' | 'product' | 'article';
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd?: JsonLdSchema;
  noIndex?: boolean;
}

export class SeoMetaBuilder {
  private data: Partial<SeoMeta> = {
    ogType: 'website',
    twitterCard: 'summary_large_image',
  };

  title(title: string): this {
    this.data.title = title;
    // Default OG/Twitter titles to the page title unless overridden
    if (!this.data.ogTitle) this.data.ogTitle = title;
    if (!this.data.twitterTitle) this.data.twitterTitle = title;
    return this;
  }

  description(desc: string): this {
    this.data.description = desc;
    if (!this.data.ogDescription) this.data.ogDescription = desc;
    if (!this.data.twitterDescription) this.data.twitterDescription = desc;
    return this;
  }

  canonical(url: string): this {
    this.data.canonical = url;
    return this;
  }

  ogType(type: SeoMeta['ogType']): this {
    this.data.ogType = type;
    return this;
  }

  ogImage(url: string, alt: string, width = 1200, height = 630): this {
    this.data.ogImage = { url, alt, width, height };
    this.data.twitterImage = url;
    return this;
  }

  twitterCard(card: SeoMeta['twitterCard']): this {
    this.data.twitterCard = card;
    return this;
  }

  jsonLd(schema: JsonLdSchema): this {
    this.data.jsonLd = schema;
    return this;
  }

  noIndex(value = true): this {
    this.data.noIndex = value;
    return this;
  }

  build(): SeoMeta {
    const required: (keyof SeoMeta)[] = ['title', 'description', 'canonical'];
    for (const field of required) {
      if (!this.data[field]) {
        throw new Error(`SeoMetaBuilder: missing required field "${field}"`);
      }
    }

    const fallbackImage: OgImage = { url: '/assets/images/og-cover.jpg', alt: 'Alexa Bijoux', width: 1200, height: 630 };
    return {
      ...this.data,
      ogTitle: this.data.ogTitle ?? this.data.title!,
      ogDescription: this.data.ogDescription ?? this.data.description!,
      ogImage: this.data.ogImage ?? fallbackImage,
      twitterTitle: this.data.twitterTitle ?? this.data.title!,
      twitterDescription: this.data.twitterDescription ?? this.data.description!,
      twitterImage: this.data.twitterImage ?? fallbackImage.url,
    } as SeoMeta;
  }
}

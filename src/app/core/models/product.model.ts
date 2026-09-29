import type { CategorySlug } from './category.model';

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  categoryName: string;
  images: ProductImage[];
  featured: boolean;
  materials?: string[];
  createdAt: string;
}

// Contentful raw response types (internal to ContentfulService)
export interface ContentfulAsset {
  sys: { id: string };
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: { image?: { width: number; height: number } };
    };
  };
}

export interface ContentfulEntry<T = Record<string, unknown>> {
  sys: { id: string; createdAt: string };
  fields: T;
}

export interface ContentfulProductFields {
  name: string;
  slug: string;
  description: string;
  category: ContentfulEntry<{ name: string; slug: CategorySlug }>;
  images: ContentfulAsset[];
  featured?: boolean;
  materials?: string[];
}

export interface ContentfulResponse<T> {
  total: number;
  items: ContentfulEntry<T>[];
  includes?: {
    Asset?: ContentfulAsset[];
    Entry?: ContentfulEntry[];
  };
}

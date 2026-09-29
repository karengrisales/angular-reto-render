/**
 * PATTERN: Facade (GoF Structural)
 *
 * Problem: The Contentful REST API requires knowing about space IDs, bearer
 * tokens, linked asset resolution, field normalization, and HTTP error handling.
 * Scattering that knowledge across multiple components couples them to the CMS.
 *
 * Solution: ContentfulService exposes a clean domain API — getProducts(),
 * getProductBySlug(), getCategories() — and hides every CMS detail.
 * Swapping Contentful for another CMS means changing only this file.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ContentfulAsset,
  ContentfulEntry,
  ContentfulProductFields,
  ContentfulResponse,
  Product,
  ProductImage,
} from '../models/product.model';
import type { Category } from '../models/category.model';

interface ContentfulCategoryFields {
  name: string;
  slug: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ContentfulService {
  private readonly http = inject(HttpClient);
  private readonly cfg = environment.contentful;
  private readonly base = `${this.cfg.cdnBase}/spaces/${this.cfg.spaceId}/environments/${this.cfg.environment}`;
  private readonly authHeader = { Authorization: `Bearer ${this.cfg.accessToken}` };

  // SharedReplay(1) caches the category list for the app lifetime — it rarely changes.
  private readonly categories$ = this.fetchCategories().pipe(shareReplay(1));

  getProducts(category?: string): Observable<Product[]> {
    let params = new HttpParams()
      .set('content_type', 'product')
      .set('include', '2')
      .set('order', '-sys.createdAt');

    if (category) {
      params = params.set('fields.category.fields.slug[match]', category);
    }

    return this.http
      .get<ContentfulResponse<ContentfulProductFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(map(res => res.items.map(item => this.toProduct(item))));
  }

  getFeaturedProducts(): Observable<Product[]> {
    const params = new HttpParams()
      .set('content_type', 'product')
      .set('fields.featured', 'true')
      .set('include', '2')
      .set('order', '-sys.createdAt')
      .set('limit', '8');

    return this.http
      .get<ContentfulResponse<ContentfulProductFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(map(res => res.items.map(item => this.toProduct(item))));
  }

  getProductBySlug(slug: string): Observable<Product | null> {
    const params = new HttpParams()
      .set('content_type', 'product')
      .set('fields.slug[match]', slug)
      .set('include', '2')
      .set('limit', '1');

    return this.http
      .get<ContentfulResponse<ContentfulProductFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(map(res => (res.items[0] ? this.toProduct(res.items[0]) : null)));
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private normalizers — only this service knows about Contentful internals
  // ──────────────────────────────────────────────────────────────────────────

  private fetchCategories(): Observable<Category[]> {
    const params = new HttpParams()
      .set('content_type', 'category')
      .set('order', 'fields.name');

    return this.http
      .get<ContentfulResponse<ContentfulCategoryFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(
        map(res =>
          res.items.map(item => ({
            id: item.sys.id,
            name: item.fields.name,
            slug: item.fields.slug as Category['slug'],
            icon: item.fields.icon ?? '',
          }))
        )
      );
  }

  private toProduct(entry: ContentfulEntry<ContentfulProductFields>): Product {
    const f = entry.fields;
    return {
      id: entry.sys.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      category: f.category?.fields?.slug ?? 'collares',
      categoryName: f.category?.fields?.name ?? '',
      images: (f.images ?? []).map(a => this.toImage(a)),
      featured: f.featured ?? false,
      materials: f.materials ?? [],
      createdAt: entry.sys.createdAt,
    };
  }

  private toImage(asset: ContentfulAsset): ProductImage {
    const file = asset.fields.file;
    const imgDetails = file.details.image;
    // Contentful URLs start with // — ensure HTTPS for SSR
    const url = file.url.startsWith('//') ? `https:${file.url}` : file.url;
    return {
      url: `${url}?fm=webp&q=80`,
      alt: asset.fields.description ?? asset.fields.title,
      width: imgDetails?.width ?? 800,
      height: imgDetails?.height ?? 800,
    };
  }
}

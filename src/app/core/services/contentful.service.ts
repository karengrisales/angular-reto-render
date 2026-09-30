/**
 * PATTERN: Facade (GoF Structural)
 *
 * Problem: The Contentful REST API requires knowing about space IDs, bearer
 * tokens, linked asset resolution, field normalization, and HTTP error handling.
 * Scattering that knowledge across multiple components couples them to the CMS.
 *
 * Solution: ContentfulService exposes a clean domain API — getProducts(),
 * getProductBySlug(), getNewProducts() — and hides every CMS detail.
 * Swapping Contentful for another CMS means changing only this file.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ContentfulAsset,
  ContentfulEntry,
  ContentfulLink,
  ContentfulProductFields,
  ContentfulResponse,
  Product,
  ProductImage,
} from '../models/product.model';
import { ALL_CATEGORIES } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class ContentfulService {
  private readonly http = inject(HttpClient);
  private readonly cfg = environment.contentful;
  private readonly base = `${this.cfg.cdnBase}/spaces/${this.cfg.spaceId}/environments/${this.cfg.environment}`;
  private readonly authHeader = { Authorization: `Bearer ${this.cfg.accessToken}` };

  getProducts(category?: string): Observable<Product[]> {
    let params = new HttpParams()
      .set('content_type', 'product')
      .set('include', '2')
      .set('order', '-sys.createdAt');

    if (category) {
      params = params.set('fields.category', category);
    }

    return this.http
      .get<ContentfulResponse<ContentfulProductFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(map(res => res.items.map(item => this.toProduct(item, res.includes?.Asset ?? []))));
  }

  getNewProducts(): Observable<Product[]> {
    const params = new HttpParams()
      .set('content_type', 'product')
      .set('fields.isNew', 'true')
      .set('include', '2')
      .set('order', '-sys.createdAt')
      .set('limit', '8');

    return this.http
      .get<ContentfulResponse<ContentfulProductFields>>(`${this.base}/entries`, {
        headers: this.authHeader,
        params,
      })
      .pipe(map(res => res.items.map(item => this.toProduct(item, res.includes?.Asset ?? []))));
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
      .pipe(map(res => (res.items[0] ? this.toProduct(res.items[0], res.includes?.Asset ?? []) : null)));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private normalizers — only this service knows about Contentful internals
  // ──────────────────────────────────────────────────────────────────────────

  private toProduct(entry: ContentfulEntry<ContentfulProductFields>, assets: ContentfulAsset[]): Product {
    const f = entry.fields;
    return {
      id: entry.sys.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      category: f.category ?? 'collares',
      categoryName: ALL_CATEGORIES.find(c => c.slug === f.category)?.name ?? '',
      images: this.resolveAssets(f.images ?? [], assets).map(a => this.toImage(a)),
      isNew: f.isNew ?? false,
      materials: f.material ? [f.material] : [],
      createdAt: entry.sys.createdAt,
    };
  }

  // Entries only carry links to their images; the asset data comes in `includes.Asset`
  private resolveAssets(links: ContentfulLink[], assets: ContentfulAsset[]): ContentfulAsset[] {
    return links
      .map(link => assets.find(asset => asset.sys.id === link.sys.id))
      .filter((asset): asset is ContentfulAsset => !!asset);
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

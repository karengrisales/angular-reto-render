import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MainLayoutComponent } from '../../shared/templates/main-layout/main-layout.component';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { ProductGridComponent } from '../../shared/organisms/product-grid/product-grid.component';
import { ContentfulService } from '../../core/services/contentful.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/config/brand.config';
import type { Product } from '../../core/models/product.model';
import { catchError, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    MainLayoutComponent,
    BadgeComponent,
    ButtonComponent,
    ProductGridComponent,
    RouterLink,
    NgOptimizedImage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'product-detail.component.html',
  styleUrl: 'product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentful = inject(ContentfulService);
  private readonly favs = inject(FavoritesService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly activeImageIndex = signal(0);
  protected readonly relatedProducts = signal<Product[]>([]);
  protected readonly isFav = computed(() =>
    this.product() ? this.favs.isFavorite(this.product()!.id) : false
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          const slug = params.get('slug') ?? '';
          this.loading.set(true);
          this.activeImageIndex.set(0);
          return this.contentful.getProductBySlug(slug).pipe(catchError(() => of(null)));
        })
      )
      .subscribe(product => {
        this.product.set(product);
        this.loading.set(false);
        if (product) {
          this.setSeo(product);
          this.loadRelated(product);
        } else {
          this.notFound.set(true);
        }
      });
  }

  setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  toggleFavorite(): void {
    const p = this.product();
    if (p) this.favs.toggle(p.id);
  }

  private loadRelated(product: Product): void {
    this.contentful
      .getProducts(product.category)
      .pipe(catchError(() => of([])))
      .subscribe(products =>
        this.relatedProducts.set(products.filter(p => p.id !== product.id).slice(0, 4))
      );
  }

  private setSeo(product: Product): void {
    const coverUrl = product.images[0]?.url ?? BRAND.ogImage;
    const meta = this.seo
      .createBuilder()
      .title(product.name)
      .description(product.description || `${product.name} — ${product.categoryName} artesanal de ${BRAND.name}.`)
      .ogType('product')
      .ogImage(coverUrl, product.name, 800, 800)
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.map(i => i.url),
        category: product.categoryName,
        brand: { '@type': 'Brand', name: BRAND.name },
        url: `${BRAND.url}/producto/${product.slug}`,
      })
      .build();
    this.seo.apply(meta);
  }
}

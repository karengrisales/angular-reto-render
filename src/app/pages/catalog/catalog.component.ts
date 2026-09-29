import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../shared/templates/main-layout/main-layout.component';
import { ProductGridComponent } from '../../shared/organisms/product-grid/product-grid.component';
import { CategoryFilterComponent } from '../../shared/organisms/category-filter/category-filter.component';
import { ContentfulService } from '../../core/services/contentful.service';
import { ProductSortService } from '../../core/services/product-sort.service';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/config/brand.config';
import { ALL_CATEGORIES } from '../../core/models/category.model';
import type { Category } from '../../core/models/category.model';
import type { Product } from '../../core/models/product.model';
import { catchError, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [MainLayoutComponent, ProductGridComponent, CategoryFilterComponent, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'catalog.component.html',
  styleUrl: 'catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentful = inject(ContentfulService);
  private readonly sortSvc = inject(ProductSortService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sortService = this.sortSvc;
  protected readonly categories: Category[] = ALL_CATEGORIES as Category[];
  protected readonly activeCategory = signal<string>('all');
  protected readonly rawProducts = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly sortedProducts = computed(() =>
    this.sortSvc.sort(this.rawProducts())
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          const slug = params.get('category') ?? 'all';
          this.activeCategory.set(slug);
          this.loading.set(true);
          this.setSeo(slug);
          const cat$ = slug === 'all'
            ? this.contentful.getProducts()
            : this.contentful.getProducts(slug);
          return cat$.pipe(catchError(() => of([])));
        })
      )
      .subscribe(products => {
        this.rawProducts.set(products);
        this.loading.set(false);
      });
  }

  onFilterChange(slug: string): void {
    if (slug === 'all') {
      this.router.navigate(['/catalogo']);
    } else {
      this.router.navigate(['/catalogo', slug]);
    }
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortSvc.setStrategy(value);
  }

  private setSeo(categorySlug: string): void {
    const cat = this.categories.find(c => c.slug === categorySlug);
    const title = cat ? `${cat.name} — Catálogo` : 'Catálogo';
    const desc = cat
      ? `Explora nuestra colección de ${cat.name.toLowerCase()} artesanales. ${BRAND.description}`
      : `Explora todo el catálogo de bisutería artesanal de ${BRAND.name}.`;

    const meta = this.seo
      .createBuilder()
      .title(title)
      .description(desc)
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: desc,
        url: `${BRAND.url}/catalogo${cat ? '/' + cat.slug : ''}`,
      })
      .build();
    this.seo.apply(meta);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '../../shared/templates/main-layout/main-layout.component';
import { ProductGridComponent } from '../../shared/organisms/product-grid/product-grid.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { ContentfulService } from '../../core/services/contentful.service';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/config/brand.config';
import { ALL_CATEGORIES } from '../../core/models/category.model';
import type { Product } from '../../core/models/product.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MainLayoutComponent, ProductGridComponent, ButtonComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'home.component.html',
  styleUrl: 'home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly contentful = inject(ContentfulService);
  private readonly seo = inject(SeoService);

  protected readonly brand = BRAND;
  protected readonly categories = ALL_CATEGORIES;
  protected readonly newProducts = signal<Product[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.setSeo();
    this.contentful
      .getNewProducts()
      .pipe(catchError(() => of([])))
      .subscribe(products => {
        this.newProducts.set(products);
        this.loading.set(false);
      });
  }

  private setSeo(): void {
    const meta = this.seo
      .createBuilder()
      .title(BRAND.name)
      .description(BRAND.description)
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BRAND.name,
        description: BRAND.description,
        url: BRAND.url,
        sameAs: [BRAND.instagram],
      })
      .build();
    this.seo.apply(meta);
  }
}

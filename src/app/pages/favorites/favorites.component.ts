import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '../../shared/templates/main-layout/main-layout.component';
import { ProductGridComponent } from '../../shared/organisms/product-grid/product-grid.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { ContentfulService } from '../../core/services/contentful.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/config/brand.config';
import type { Product } from '../../core/models/product.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [MainLayoutComponent, ProductGridComponent, ButtonComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'favorites.component.html',
  styleUrl: 'favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  private readonly contentful = inject(ContentfulService);
  private readonly favs = inject(FavoritesService);
  private readonly seo = inject(SeoService);

  protected readonly count = this.favs.count;
  protected readonly isEmpty = this.favs.isEmpty;
  protected readonly allProducts = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly favoriteProducts = computed(() => {
    const ids = this.favs.favoriteIds();
    return this.allProducts().filter(p => ids.has(p.id));
  });

  ngOnInit(): void {
    this.setSeo();
    this.contentful
      .getProducts()
      .pipe(catchError(() => of([])))
      .subscribe(products => {
        this.allProducts.set(products);
        this.loading.set(false);
      });
  }

  clearAll(): void {
    this.favs.clearAll();
  }

  private setSeo(): void {
    const meta = this.seo
      .createBuilder()
      .title('Mis favoritos')
      .description(`Tus piezas guardadas de ${BRAND.name}. Vuelve cuando quieras a explorarlas.`)
      .noIndex()
      .build();
    this.seo.apply(meta);
  }
}

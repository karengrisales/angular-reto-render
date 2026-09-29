import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { FavoritesService } from '../../../core/services/favorites.service';
import type { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'product-card.component.html',
  styleUrl: 'product-card.component.scss',
})
export class ProductCardComponent {
  product   = input.required<Product>();
  priority  = input(false);

  cardClicked = output<Product>();

  private readonly favorites = inject(FavoritesService);

  protected readonly isFav = computed(() =>
    this.favorites.isFavorite(this.product().id)
  );

  protected get coverImage() {
    return this.product().images[0];
  }

  toggleFavorite(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.product().id);
  }
}

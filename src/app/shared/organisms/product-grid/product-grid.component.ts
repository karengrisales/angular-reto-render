import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ProductCardComponent } from '../../molecules/product-card/product-card.component';
import type { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'product-grid.component.html',
  styleUrl: 'product-grid.component.scss',
})
export class ProductGridComponent {
  products = input.required<Product[]>();
  loading  = input(false);
  /** How many skeleton cards to show while loading */
  skeletonCount = input(8);
  /** First N cards get priority LCP treatment */
  priorityCount = input(4);
}

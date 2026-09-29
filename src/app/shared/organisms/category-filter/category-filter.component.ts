import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterChipComponent } from '../../molecules/filter-chip/filter-chip.component';
import type { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [FilterChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'category-filter.component.html',
  styleUrl: 'category-filter.component.scss',
})
export class CategoryFilterComponent {
  categories   = input.required<Category[]>();
  activeSlug   = input<string>('all');

  filterChanged = output<string>();

  readonly allOption: Pick<Category, 'name' | 'slug' | 'icon'> = {
    name: 'Todos', slug: 'all' as Category['slug'], icon: '🌟',
  };
}

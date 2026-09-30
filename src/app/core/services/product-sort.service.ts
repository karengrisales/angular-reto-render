/**
 * PATTERN: Strategy (GoF Behavioral)
 *
 * Problem: The catalog needs multiple sort orders (newest, A–Z, Z–A, new
 * first). Using if/switch chains in the component violates Open/Closed and
 * makes testing hard.
 *
 * Solution: Each sort algorithm is a SortStrategy object. ProductSortService
 * holds the active strategy in a Signal. Switching strategies at runtime (user
 * changes the sort dropdown) just calls setStrategy() — the catalog component
 * calls sort() without knowing which algorithm runs.
 *
 * Adding a new sort order = adding a new class that implements SortStrategy,
 * zero changes to existing code.
 */
import { Injectable, computed, signal } from '@angular/core';
import type { Product } from '../models/product.model';

// ── Strategy interface ───────────────────────────────────────────────────────
export interface SortStrategy {
  readonly value: string;
  readonly label: string;
  sort(products: Product[]): Product[];
}

// ── Concrete Strategies ──────────────────────────────────────────────────────
export class NewestFirstStrategy implements SortStrategy {
  readonly value = 'newest';
  readonly label = 'Más recientes';
  sort(products: Product[]): Product[] {
    return [...products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export class NameAscStrategy implements SortStrategy {
  readonly value = 'name-asc';
  readonly label = 'Nombre A–Z';
  sort(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}

export class NameDescStrategy implements SortStrategy {
  readonly value = 'name-desc';
  readonly label = 'Nombre Z–A';
  sort(products: Product[]): Product[] {
    return [...products].sort((a, b) => b.name.localeCompare(a.name, 'es'));
  }
}

export class NewFirstStrategy implements SortStrategy {
  readonly value = 'new';
  readonly label = 'Novedades primero';
  sort(products: Product[]): Product[] {
    return [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }
}

// ── Context (the service that holds the active strategy) ────────────────────
@Injectable({ providedIn: 'root' })
export class ProductSortService {
  readonly strategies: SortStrategy[] = [
    new NewestFirstStrategy(),
    new NameAscStrategy(),
    new NameDescStrategy(),
    new NewFirstStrategy(),
  ];

  private readonly _active = signal<SortStrategy>(this.strategies[0]);
  readonly active = this._active.asReadonly();
  readonly activeLabel = computed(() => this._active().label);

  setStrategy(value: string): void {
    const found = this.strategies.find(s => s.value === value);
    if (found) this._active.set(found);
  }

  sort(products: Product[]): Product[] {
    return this._active().sort(products);
  }
}

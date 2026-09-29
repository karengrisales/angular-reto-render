/**
 * PATTERN: Observer (GoF Behavioral) — implemented via Angular Signals
 *
 * Problem: Multiple unrelated components (product card, favorites page, header
 * counter) need to react when the favorites list changes. Passing callbacks or
 * using @Input/@Output chains creates tight coupling.
 *
 * Solution: FavoritesService holds the authoritative Signal<Set<string>>.
 * Components observe it with computed() signals or read favoriteIds directly.
 * When toggle() mutates the state, every Signal subscriber reacts automatically
 * — the same mechanism as the classic Observer pattern, built into Angular.
 */
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'ab-favorites';

  // The subject: Signal holds the authoritative Set of favorited product IDs.
  private readonly _ids = signal<Set<string>>(this.loadFromStorage());

  // Public observers: computed signals derived from the subject.
  readonly favoriteIds = this._ids.asReadonly();
  readonly count = computed(() => this._ids().size);
  readonly isEmpty = computed(() => this._ids().size === 0);

  toggle(productId: string): void {
    this._ids.update(ids => {
      const next = new Set(ids);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      this.persist(next);
      return next;
    });
  }

  isFavorite(productId: string): boolean {
    return this._ids().has(productId);
  }

  clearAll(): void {
    this._ids.set(new Set());
    this.persist(new Set());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Persistence — browser-only; SSR skips localStorage safely
  // ──────────────────────────────────────────────────────────────────────────

  private loadFromStorage(): Set<string> {
    if (!isPlatformBrowser(this.platformId)) return new Set();
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private persist(ids: Set<string>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...ids]));
    } catch {
      // localStorage might be full or unavailable (private mode)
    }
  }
}

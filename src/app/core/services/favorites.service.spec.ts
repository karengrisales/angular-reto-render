import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { FavoritesService } from './favorites.service';

describe('FavoritesService (Observer/Signal pattern)', () => {
  let service: FavoritesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FavoritesService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    localStorage.clear();
    service = TestBed.inject(FavoritesService);
  });

  it('starts with no favorites', () => {
    expect(service.count()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('adds a product when toggled the first time', () => {
    service.toggle('prod-1');
    expect(service.count()).toBe(1);
    expect(service.isFavorite('prod-1')).toBe(true);
  });

  it('removes a product when toggled a second time', () => {
    service.toggle('prod-1');
    service.toggle('prod-1');
    expect(service.isFavorite('prod-1')).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('handles multiple products independently', () => {
    service.toggle('prod-1');
    service.toggle('prod-2');
    expect(service.count()).toBe(2);
    service.toggle('prod-1');
    expect(service.count()).toBe(1);
    expect(service.isFavorite('prod-2')).toBe(true);
  });

  it('clears all favorites', () => {
    service.toggle('prod-1');
    service.toggle('prod-2');
    service.clearAll();
    expect(service.count()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('persists favorites to localStorage', () => {
    service.toggle('prod-1');
    const stored = JSON.parse(localStorage.getItem('ab-favorites') ?? '[]');
    expect(stored).toContain('prod-1');
  });
});

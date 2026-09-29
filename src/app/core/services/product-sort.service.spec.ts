import { TestBed } from '@angular/core/testing';
import {
  ProductSortService,
  NewestFirstStrategy,
  NameAscStrategy,
  NameDescStrategy,
  FeaturedFirstStrategy,
} from './product-sort.service';
import type { Product } from '../models/product.model';

const mockProducts: Product[] = [
  { id: '1', slug: 'collar-a', name: 'Collar Amanecer', category: 'collares', categoryName: 'Collares', images: [], featured: false, materials: [], createdAt: '2024-01-01', description: '' },
  { id: '2', slug: 'arete-b', name: 'Arete Brillo', category: 'aretes', categoryName: 'Aretes', images: [], featured: true, materials: [], createdAt: '2024-03-15', description: '' },
  { id: '3', slug: 'manilla-c', name: 'Manilla Cielo', category: 'manillas', categoryName: 'Manillas', images: [], featured: false, materials: [], createdAt: '2024-02-10', description: '' },
];

describe('ProductSortService (Strategy pattern)', () => {
  let service: ProductSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProductSortService] });
    service = TestBed.inject(ProductSortService);
  });

  it('defaults to newest-first strategy', () => {
    expect(service.active().value).toBe('newest');
  });

  it('NewestFirstStrategy sorts by date descending', () => {
    const strategy = new NewestFirstStrategy();
    const sorted = strategy.sort(mockProducts);
    expect(sorted[0].id).toBe('2'); // 2024-03-15
    expect(sorted[2].id).toBe('1'); // 2024-01-01
  });

  it('NameAscStrategy sorts A–Z', () => {
    const strategy = new NameAscStrategy();
    const sorted = strategy.sort(mockProducts);
    expect(sorted[0].name).toBe('Arete Brillo');
    expect(sorted[1].name).toBe('Collar Amanecer');
    expect(sorted[2].name).toBe('Manilla Cielo');
  });

  it('NameDescStrategy sorts Z–A', () => {
    const strategy = new NameDescStrategy();
    const sorted = strategy.sort(mockProducts);
    expect(sorted[0].name).toBe('Manilla Cielo');
  });

  it('FeaturedFirstStrategy puts featured products first', () => {
    const strategy = new FeaturedFirstStrategy();
    const sorted = strategy.sort(mockProducts);
    expect(sorted[0].featured).toBe(true);
  });

  it('setStrategy switches the active algorithm', () => {
    service.setStrategy('name-asc');
    expect(service.active().value).toBe('name-asc');
    const sorted = service.sort(mockProducts);
    expect(sorted[0].name).toBe('Arete Brillo');
  });

  it('does not mutate the input array', () => {
    const original = [...mockProducts];
    service.sort(mockProducts);
    expect(mockProducts).toEqual(original);
  });
});

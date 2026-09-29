export type CategorySlug = 'collares' | 'manillas' | 'aretes' | 'anillos';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  icon: string;
  productCount?: number;
}

export const ALL_CATEGORIES: Pick<Category, 'name' | 'slug' | 'icon'>[] = [
  { name: 'Collares',  slug: 'collares', icon: '📿' },
  { name: 'Manillas',  slug: 'manillas', icon: '💫' },
  { name: 'Aretes',    slug: 'aretes',   icon: '✨' },
  { name: 'Anillos',   slug: 'anillos',  icon: '💍' },
];

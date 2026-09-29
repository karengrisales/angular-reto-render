import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Alexa Bijoux — Sé tu propia inspiración',
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Catálogo — Alexa Bijoux',
  },
  {
    path: 'catalogo/:category',
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Catálogo — Alexa Bijoux',
  },
  {
    path: 'producto/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      ),
  },
  {
    path: 'quienes-somos',
    loadComponent: () =>
      import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'Quiénes somos — Alexa Bijoux',
  },
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    title: 'Mis favoritos — Alexa Bijoux',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

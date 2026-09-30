/**
 * Generates prerender-routes.txt before each build.
 *
 * Angular can only discover routes without parameters, so /producto/:slug
 * needs the list of slugs published in Contentful. /favoritos is prerendered
 * only as a shell: its list depends on each user's localStorage and is filled
 * in the browser (see FavoritesComponent).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const env = readFileSync('src/environments/environment.prod.ts', 'utf8');
const read = key => env.match(new RegExp(`${key}:\\s*'([^']+)'`))[1];

const spaceId = process.env.CONTENTFUL_SPACE_ID ?? read('spaceId');
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN ?? read('accessToken');
const environment = read('environment');

const staticRoutes = [
  '/',
  '/catalogo',
  '/catalogo/collares',
  '/catalogo/manillas',
  '/catalogo/aretes',
  '/catalogo/anillos',
  '/quienes-somos',
  '/favoritos',
];

const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=product&select=fields.slug&limit=1000`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
if (!res.ok) {
  throw new Error(`Contentful respondió ${res.status} al pedir los slugs de productos`);
}
const { items } = await res.json();
const productRoutes = items.map(item => `/producto/${item.fields.slug}`);

const routes = [...staticRoutes, ...productRoutes];
writeFileSync('prerender-routes.txt', routes.join('\n') + '\n');
console.log(`prerender-routes.txt: ${routes.length} rutas (${productRoutes.length} productos)`);

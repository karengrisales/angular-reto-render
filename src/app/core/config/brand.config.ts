/**
 * Centralized brand configuration — change name and slogan here only.
 */
export const BRAND = {
  name: 'Alexa Bijoux',
  slogan: 'Sé tu propia inspiración',
  description:
    'Bisutería artesanal única, creada con amor y detalle. Collares, manillas, aretes y anillos que expresan tu personalidad.',
  url: 'https://alexabijoux.com',
  ogImage: '/assets/images/og-cover.jpg',
  twitterHandle: '@alexabijoux',
  email: 'hola@alexabijoux.com',
  instagram: 'https://instagram.com/alexabijoux',
} as const;

export type BrandConfig = typeof BRAND;

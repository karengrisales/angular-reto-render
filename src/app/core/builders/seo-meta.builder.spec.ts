import { SeoMetaBuilder } from './seo-meta.builder';

describe('SeoMetaBuilder (Builder pattern)', () => {
  it('builds a valid SeoMeta object with required fields', () => {
    const meta = new SeoMetaBuilder()
      .title('Test Page')
      .description('A test description')
      .canonical('https://alexabijoux.com/test')
      .build();

    expect(meta.title).toBe('Test Page');
    expect(meta.description).toBe('A test description');
    expect(meta.canonical).toBe('https://alexabijoux.com/test');
  });

  it('defaults OG/Twitter fields to the main title and description', () => {
    const meta = new SeoMetaBuilder()
      .title('Product Name')
      .description('Great product')
      .canonical('https://alexabijoux.com/producto/test')
      .build();

    expect(meta.ogTitle).toBe('Product Name');
    expect(meta.ogDescription).toBe('Great product');
    expect(meta.twitterTitle).toBe('Product Name');
  });

  it('defaults ogType to "website"', () => {
    const meta = new SeoMetaBuilder()
      .title('T')
      .description('D')
      .canonical('https://alexabijoux.com')
      .build();

    expect(meta.ogType).toBe('website');
  });

  it('allows overriding ogType to "product"', () => {
    const meta = new SeoMetaBuilder()
      .title('T')
      .description('D')
      .canonical('https://alexabijoux.com')
      .ogType('product')
      .build();

    expect(meta.ogType).toBe('product');
  });

  it('sets ogImage and mirrors it to twitterImage', () => {
    const meta = new SeoMetaBuilder()
      .title('T')
      .description('D')
      .canonical('https://alexabijoux.com')
      .ogImage('https://example.com/img.jpg', 'Alt text')
      .build();

    expect(meta.ogImage.url).toBe('https://example.com/img.jpg');
    expect(meta.twitterImage).toBe('https://example.com/img.jpg');
  });

  it('throws when a required field is missing', () => {
    expect(() =>
      new SeoMetaBuilder().title('T').description('D').build()
    ).toThrow(/canonical/);
  });

  it('attaches JSON-LD schema', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' };
    const meta = new SeoMetaBuilder()
      .title('T')
      .description('D')
      .canonical('https://alexabijoux.com')
      .jsonLd(schema)
      .build();

    expect(meta.jsonLd).toEqual(schema);
  });

  it('noIndex sets the noIndex flag', () => {
    const meta = new SeoMetaBuilder()
      .title('T')
      .description('D')
      .canonical('https://alexabijoux.com')
      .noIndex()
      .build();

    expect(meta.noIndex).toBe(true);
  });
});

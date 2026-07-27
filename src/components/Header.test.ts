import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from './Header.astro';

describe('Header', () => {
  it('provides semantic navigation to the consultation call to action', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).toContain('<nav aria-label="Navegación principal"');
    expect(html).toContain('href="#consulta"');
    expect(html).toContain('Solicitar una consulta');
  });

  it('renders the approved brand logo as the home link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).toContain('href="/"');
    expect(html).toContain('src="/brand/logo.png"');
    expect(html).toContain('alt="MyNutriCoach"');
  });

  it('shows the configured login destination', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      props: { loginUrl: 'https://app.example.com/login' },
    });

    expect(html).toContain('Ingresar');
    expect(html).toContain('href="https://app.example.com/login"');
  });

  it('hides login when no usable URL exists', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, { props: { loginUrl: undefined } });

    expect(html).not.toContain('Ingresar');
    expect(html).not.toContain('href="/login"');
  });
});

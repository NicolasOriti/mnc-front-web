import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import DemoWorkflow from './DemoWorkflow.astro';

describe('DemoWorkflow', () => {
  it('renders the approved synthetic clinician workflow demo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DemoWorkflow, {
      props: {
        demo: {
          alt: 'Flujo de trabajo de la nutricionista',
          src: '/demos/clinician-workflow-v1.svg',
        },
      },
    });

    expect(html).toContain('/demos/clinician-workflow-v1.svg');
    expect(html).toContain('Flujo de trabajo de la nutricionista');
  });

  it('does not render a workflow when no approved demo is available', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DemoWorkflow, { props: { demo: undefined } });

    expect(html).not.toContain('<img');
    expect(html).toContain('La demostración estará disponible pronto.');
  });
});

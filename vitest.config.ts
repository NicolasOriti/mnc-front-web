import { getViteConfig } from 'astro/config';
import type { UserConfig } from 'vite';

const vitestConfig = {
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
};

export default getViteConfig(vitestConfig as unknown as UserConfig);

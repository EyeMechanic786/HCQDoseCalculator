import { defineConfig } from 'vite';

const repoName = 'HCQDoseCalculator';
const base = `/${repoName}/`;

export default defineConfig({
  base,
  test: {
    include: ['tests/**/*.test.ts'],
  },
});

import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10_000,
  },
};

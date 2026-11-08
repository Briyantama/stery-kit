import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// UI component tests run in jsdom; api/sveltekit tests stay in node.
export default defineConfig({
	plugins: [svelte()],
	test: {
		projects: [
			{
				extends: true,
				test: { name: 'node', include: ['src/*.test.ts', 'src/sveltekit/**/*.test.ts'], environment: 'node' }
			},
			{
				extends: true,
				resolve: { conditions: ['browser'] },
				test: {
					name: 'ui',
					include: ['src/ui/**/*.test.ts'],
					environment: 'jsdom',
					setupFiles: ['./vitest.setup.ts']
				}
			}
		]
	}
});

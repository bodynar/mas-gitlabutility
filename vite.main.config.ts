import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config
export default defineConfig({
	resolve: {
		// Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
		browserField: false,
		mainFields: ["module", "jsnext:main", "jsnext"],
	},
	plugins: [
		react(),
		tsconfigPaths(),
		eslintPlugin(),
	],
});

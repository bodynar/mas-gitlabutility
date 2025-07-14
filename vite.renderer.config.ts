import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import eslintPlugin from "vite-plugin-eslint";

const localeProcessArgKey = "--app-locale";

const appLocaleValue = process.argv
	.find(x => x.startsWith(localeProcessArgKey))
	?.substring(localeProcessArgKey.length + 1);

// https://vitejs.dev/config
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		eslintPlugin(),
	],
	define: {
		appLocale: appLocaleValue,
	}
});

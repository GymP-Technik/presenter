import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import child_process from "child_process";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	define: {
		"import.meta.env.GIT":
			'{ "a": "' + child_process.execSync("git rev-parse HEAD").toString().trim() + '" }',
	},
	build: {
		outDir: "../backend/static",
		minify: true,
	},
});

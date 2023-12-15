/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly PACKAGE_VERSION: string;
	readonly REMOTE_API: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

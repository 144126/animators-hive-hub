declare global {
	namespace App {
		interface Platform {
			env?: Record<string, string>;
			ctx?: { waitUntil(p: Promise<unknown>): void };
			caches?: CacheStorage;
		}
	}
}

export {};

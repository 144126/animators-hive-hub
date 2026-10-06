type VecMeta = Record<string, string | number | boolean | string[]>;

type Vec = {
	id: string;
	metadata?: VecMeta;
};

type VecIndex = {
	query(
		vector: number[],
		opts?: { topK?: number; returnMetadata?: 'all' | 'indexed' | 'none'; filter?: Record<string, unknown> }
	): Promise<{ matches: Array<Vec & { score: number }> }>;
	upsert(vectors: Array<{ id: string; values: number[]; metadata?: VecMeta }>): Promise<unknown>;
	getByIds(ids: string[]): Promise<Vec[]>;
	deleteByIds(ids: string[]): Promise<unknown>;
};

declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string; username: string } | null;
		}
		interface Platform {
			env: { DB: VecIndex; SESSION_SECRET?: string };
			ctx?: { waitUntil(p: Promise<unknown>): void };
			caches?: CacheStorage;
		}
	}
}

export {};

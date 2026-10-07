import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string; username: string } | null;
		}
		interface Platform {
			env: { DB: D1Database; M: R2Bucket; SESSION_SECRET?: string };
			ctx?: { waitUntil(p: Promise<unknown>): void };
		}
	}
}

export {};

import type { D1Database, R2Bucket, RateLimit } from '@cloudflare/workers-types';
import type { AuthUser } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: AuthUser | null;
		}
		interface PageData {
			u: AuthUser | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				M: R2Bucket;
				RL_AUTH: RateLimit;
				RL_WRITE: RateLimit;
				RL_MEDIA: RateLimit;
				GOOGLE_ID?: string;
				GOOGLE_SECRET?: string;
			};
			ctx?: { waitUntil(p: Promise<unknown>): void };
		}
	}
}

export {};

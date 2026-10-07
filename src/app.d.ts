import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
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
				SESSION_SECRET?: string;
				GOOGLE_ID?: string;
				GOOGLE_SECRET?: string;
			};
			ctx?: { waitUntil(p: Promise<unknown>): void };
		}
	}
}

export {};

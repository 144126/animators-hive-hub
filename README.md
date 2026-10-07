# animators hive hub

sveltekit + cloudflare workers. records in d1 `ahh`, videos and thumbnails in r2 `ahh`.
dev: `pnpm exec wrangler d1 migrations apply ahh --local`, then `pnpm dev` (:8080). `.dev.vars` needs `SESSION_SECRET`, and `GOOGLE_ID`/`GOOGLE_SECRET` (same as e4) for google login.
deploys on push to main via workers builds → https://animators-hive-hub.apexlinks.workers.dev

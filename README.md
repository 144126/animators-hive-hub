# animators hive hub

sveltekit + cloudflare workers. records in d1 `ahh`, media in r2 `ahh`.

run: `pnpm dev` (:8080). `.dev.vars` needs `SESSION_SECRET`, `GOOGLE_ID`, `GOOGLE_SECRET`.

migrate: `pnpm exec wrangler d1 migrations apply ahh --local`

smoke: `node scripts/smoke.ts`

deploy: push to `mine/main` → https://animators-hive-hub.apexlinks.workers.dev

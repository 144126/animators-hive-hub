# animators hive hub

sveltekit + cloudflare. all records live in vectorize index `ahh`. no d1, kv, r2, or supabase.

```sh
pnpm i
pnpm dev               # :8080 (vectorize remote)
pnpm build
```

email+password only. video files stay as local blob urls (vectorize cannot hold files).

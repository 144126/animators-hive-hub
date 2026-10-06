# animators hive hub

sveltekit + cloudflare. all records live in vectorize index `ahh` (768d cosine).
embeddings from gemini-embedding-2 (hosted EmbeddingGemma 2 / the youtube model).

```sh
pnpm i
pnpm dev               # :8080 (vectorize remote)
pnpm build
```

email+password only. video files stay as local blob urls (vectorize cannot hold files).

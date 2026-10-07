import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request, platform }) => {
	if (!/^[0-9a-f-]{36}$/.test(params.k!)) error(404, 'not found');
	const range = request.headers.get('range');
	const m = range?.match(/^bytes=(\d*)-(\d*)$/);
	const head = await platform!.env.M.head(params.k!);
	if (!head) error(404, 'not found');
	const size = head.size;
	let start = 0;
	let end = size - 1;
	if (m && (m[1] || m[2])) {
		if (m[1]) {
			start = Number(m[1]);
			if (m[2]) end = Math.min(Number(m[2]), size - 1);
		} else start = Math.max(0, size - Number(m[2]));
		if (start > end)
			return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
	}
	const partial = !!m && (start > 0 || end < size - 1 || !!range);
	const o = await platform!.env.M.get(
		params.k!,
		partial ? { range: { offset: start, length: end - start + 1 } } : {}
	);
	if (!o) error(404, 'not found');
	const headers: Record<string, string> = {
		'content-type': head.httpMetadata?.contentType || 'application/octet-stream',
		etag: head.httpEtag,
		'accept-ranges': 'bytes',
		'cache-control': 'public, max-age=31536000, immutable',
		'content-length': String(end - start + 1)
	};
	if (partial) headers['content-range'] = `bytes ${start}-${end}/${size}`;
	return new Response(o.body as unknown as ReadableStream, {
		status: partial ? 206 : 200,
		headers
	});
};

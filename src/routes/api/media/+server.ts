import type { RequestHandler } from './$types';
import { j } from '$lib/server/session';

const max: Record<string, number> = { video: 50 * 1024 * 1024, image: 5 * 1024 * 1024 };

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const type = request.headers.get('content-type') || '';
	const limit = max[type.split('/')[0]];
	if (!limit || !/^(video|image)\/[\w.+-]+$/.test(type)) return j({ error: 'unsupported file type' }, 415);
	if (Number(request.headers.get('content-length') || 0) > limit) return j({ error: 'file too large' }, 413);
	const bytes = await request.arrayBuffer();
	if (bytes.byteLength > limit) return j({ error: 'file too large' }, 413);
	const key = crypto.randomUUID();
	await platform!.env.M.put(key, bytes, { httpMetadata: { contentType: type } });
	// u = url of the stored file
	return j({ u: `/media/${key}` });
};

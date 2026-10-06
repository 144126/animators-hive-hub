export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const r = await fetch(path, {
		...init,
		headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
	});
	const data = (await r.json().catch(() => ({}))) as T & { error?: string };
	if (!r.ok) throw new Error(data.error || r.statusText);
	return data;
}

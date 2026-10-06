export async function embed(text: string, key: string) {
	const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent', {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
		body: JSON.stringify({
			model: 'models/gemini-embedding-2',
			content: { parts: [{ text }] },
			outputDimensionality: 768
		})
	});
	const d = (await r.json()) as { embedding?: { values?: number[] }; error?: { message?: string } };
	if (!r.ok || !d.embedding?.values?.length) throw new Error(d.error?.message || 'embed failed');
	return d.embedding.values;
}

export function gemini_key(p?: App.Platform) {
	const k = p?.env?.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';
	if (!k) throw new Error('missing GEMINI_API_KEY');
	return k;
}

export function as_doc(title: string, text: string) {
	return `title: ${title || 'none'} | text: ${text}`;
}

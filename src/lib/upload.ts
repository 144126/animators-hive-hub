import { api } from './http';

export async function upload(file: Blob) {
	const { u } = await api<{ u: string }>('/api/media', {
		method: 'POST',
		body: file,
		headers: { 'content-type': file.type || 'application/octet-stream' }
	});
	return u;
}

export function thumb_from_video(file: File): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const src = URL.createObjectURL(file);
		const done = (b: Blob | null, e?: Error) => {
			URL.revokeObjectURL(src);
			if (b) resolve(b);
			else reject(e ?? new Error('no thumbnail'));
		};
		video.muted = true;
		video.playsInline = true;
		video.onloadedmetadata = () => {
			const w = Math.min(640, video.videoWidth);
			canvas.width = w;
			canvas.height = Math.round((video.videoHeight * w) / video.videoWidth);
			video.currentTime = Math.min(1, video.duration / 2);
		};
		video.onseeked = () => {
			const ctx = canvas.getContext('2d');
			if (!ctx) return done(null, new Error('no canvas'));
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob((b) => done(b), 'image/jpeg', 0.8);
		};
		video.onerror = () => done(null, new Error('failed to load video'));
		video.src = src;
		video.load();
	});
}

export function thumb_from_video(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		video.onloadedmetadata = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			video.currentTime = 1;
		};
		video.onseeked = () => {
			if (!ctx) return reject(new Error('no canvas'));
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL('image/jpeg', 0.7));
		};
		video.onerror = () => reject(new Error('failed to load video'));
		video.src = URL.createObjectURL(file);
		video.load();
	});
}

export function file_url(file: File) {
	return URL.createObjectURL(file);
}

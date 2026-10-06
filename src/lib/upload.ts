import { supabase } from './supabase';

export function thumb_from_video(file: File): Promise<File> {
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
			canvas.toBlob(
				(blob) => {
					if (!blob) return reject(new Error('failed to generate thumbnail'));
					resolve(new File([blob], `${file.name}-thumbnail.jpg`, { type: 'image/jpeg' }));
				},
				'image/jpeg',
				0.8
			);
		};
		video.onerror = () => reject(new Error('failed to load video'));
		video.src = URL.createObjectURL(file);
		video.load();
	});
}

export async function upload_file(file: File, bucket: string, folder: string, user_id: string) {
	const ext = file.name.split('.').pop();
	const name = `${folder}/${user_id}/${Date.now()}.${ext}`;
	const { error } = await supabase.storage.from(bucket).upload(name, file);
	if (error) throw error;
	return supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;
}

export async function create_community(name: string, user_id: string) {
	const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const { data, error } = await supabase
		.from('communities')
		.insert({ name: slug, display_name: name, creator_id: user_id })
		.select()
		.single();
	if (error) throw error;
	return data.id as string;
}

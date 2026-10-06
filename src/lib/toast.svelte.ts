export type Toast = { id: number; title: string; description?: string; kind: 'ok' | 'err' };

let n = 0;
let list = $state<Toast[]>([]);

export function toasts() {
	return list;
}

export function toast(title: string, description?: string, kind: Toast['kind'] = 'ok') {
	const id = ++n;
	list = [...list, { id, title, description, kind }];
	setTimeout(() => {
		list = list.filter((t) => t.id !== id);
	}, 3200);
}

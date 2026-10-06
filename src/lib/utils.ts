export function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ');
}

export function initial(name: string) {
	return (name.charAt(0) || '?').toUpperCase();
}

let light = $state(false);

export function theme() {
	return {
		get light() {
			return light;
		},
		sync() {
			light = document.documentElement.classList.contains('light');
		},
		toggle() {
			light = !light;
			document.documentElement.classList.toggle('light', light);
			try {
				localStorage.setItem('theme', light ? 'light' : 'dark');
			} catch {
				/* storage blocked */
			}
		}
	};
}

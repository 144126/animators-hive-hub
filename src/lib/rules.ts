export const username = /^[a-z0-9_]{3,30}$/i;
export const email_re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const title_max = 100;
export const desc_max = 2000;
export const comment_max = 1000;
export const list_name_max = 100;
export const list_desc_max = 500;
export const comm_name_max = 50;
export const display_max = 50;
export const bio_max = 500;
export const loc_max = 100;
export const web_max = 200;
export const pass_min = 6;
export const pass_max = 200;
export const email_max = 254;

export function ok_email(s: string) {
	return s.length > 0 && s.length <= email_max && email_re.test(s);
}

export function ok_username(s: string) {
	return username.test(s);
}

export function ok_pass(s: string) {
	return s.length >= pass_min && s.length <= pass_max;
}

export function ok_title(s: string) {
	return s.length >= 1 && s.length <= title_max;
}

export function ok_desc(s: string) {
	return s.length <= desc_max;
}

export function ok_comment(s: string) {
	return s.length >= 1 && s.length <= comment_max;
}

export function ok_list_name(s: string) {
	return s.length >= 1 && s.length <= list_name_max;
}

export function ok_list_desc(s: string) {
	return s.length <= list_desc_max;
}

export function ok_comm_name(s: string) {
	return s.length >= 1 && s.length <= comm_name_max;
}

export function ok_display(s: string) {
	return s.length >= 1 && s.length <= display_max;
}

export function ok_bio(s: string) {
	return s.length <= bio_max;
}

export function ok_loc(s: string) {
	return s.length <= loc_max;
}

export function ok_web(s: string) {
	if (!s) return true;
	if (s.length > web_max || !/^https?:\/\//i.test(s)) return false;
	try {
		new URL(s);
		return true;
	} catch {
		return false;
	}
}

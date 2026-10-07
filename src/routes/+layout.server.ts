import type { LayoutServerLoad } from './$types';

// u: the signed-in user, or null
export const load: LayoutServerLoad = ({ locals }) => ({ u: locals.user });

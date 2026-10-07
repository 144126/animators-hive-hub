import type { PageServerLoad } from './$types';
import { list_comms, sql } from '$lib/server/db';

// c: all communities
export const load: PageServerLoad = async ({ platform }) => ({
	c: await list_comms(sql(platform), '')
});

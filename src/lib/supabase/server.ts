import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
	const c = await cookies();
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
		{
			cookies: {
				getAll() {
					return c.getAll();
				},
				setAll(v) {
					v.forEach(({ name, value, options }) => {
						try {
							c.set(name, value, options);
						} catch {
							// Server Components cannot mutate cookies. Middleware/Route
							// Handlers/Server Actions will persist refreshed auth cookies.
						}
					});
				},
			},
		},
	);
}

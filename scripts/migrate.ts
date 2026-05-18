import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.error(
		"Missing DATABASE_URL. Add it to .env.local before running migrations.",
	);
	process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
const migrationsDir = path.join(process.cwd(), "supabase", "migrations");

async function main() {
	await client.connect();
	await client.query(`
	create table if not exists public.schema_migrations (
		version text primary key,
		applied_at timestamptz not null default now()
	);
`);

	const files = (await readdir(migrationsDir))
		.filter((file) => file.endsWith(".sql"))
		.sort();

	for (const file of files) {
		const { rowCount } = await client.query(
			"select 1 from public.schema_migrations where version = $1",
			[file],
		);

		if (rowCount) {
			console.log(`skip ${file}`);
			continue;
		}

		const sql = await readFile(path.join(migrationsDir, file), "utf8");
		await client.query("begin");
		try {
			await client.query(sql);
			await client.query(
				"insert into public.schema_migrations(version) values ($1)",
				[file],
			);
			await client.query("commit");
			console.log(`applied ${file}`);
		} catch (error) {
			await client.query("rollback");
			throw error;
		}
	}

	await client.end();
}

main().catch(async (error) => {
	console.error(error);
	try {
		await client.end();
	} catch {}
	process.exit(1);
});

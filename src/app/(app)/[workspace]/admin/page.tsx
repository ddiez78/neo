import { redirect } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	redirect(`/${slug}/settings?section=admin`);
}

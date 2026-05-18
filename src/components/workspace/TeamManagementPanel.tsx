import type { WorkspaceMember } from "@/types";

export function TeamManagementPanel({
	members,
}: {
	members: WorkspaceMember[];
}) {
	return (
		<div className="rounded-md border border-slate-200 bg-white">
			<div className="border-b border-slate-200 p-4">
				<h2 className="text-base font-semibold text-slate-950">Miembros</h2>
				<p className="text-sm text-slate-500">Roles y acceso al workspace.</p>
			</div>
			<div className="divide-y divide-slate-100">
				{members.length === 0 ? (
					<p className="p-4 text-sm text-slate-500">
						Todavia no hay miembros visibles.
					</p>
				) : (
					members.map((member) => (
						<div
							className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]"
							key={member.id}
						>
							<div>
								<p className="font-medium text-slate-950">
									{member.full_name || member.email || member.user_id}
								</p>
								<p className="text-sm text-slate-500">{member.email}</p>
							</div>
							<span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
								{member.role}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}

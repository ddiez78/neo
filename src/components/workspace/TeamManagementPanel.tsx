import type { WorkspaceMember } from "@/types";

export function TeamManagementPanel({
	members,
	invites = [],
	action,
}: {
	members: WorkspaceMember[];
	invites?: {
		id: string;
		email: string;
		role: string;
		expires_at: string;
	}[];
	action?: (formData: FormData) => void;
}) {
	return (
		<div className="rounded-md border border-slate-200 bg-white">
			<div className="border-b border-slate-200 p-4">
				<h2 className="text-base font-semibold text-slate-950">Miembros</h2>
				<p className="text-sm text-slate-500">Roles y acceso al workspace.</p>
			</div>
			{action ? (
				<form
					action={action}
					className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_160px_auto]"
				>
					<label className="grid gap-1 text-sm">
						<span className="font-medium text-slate-700">Email</span>
						<input
							className="rounded-md border border-slate-200 px-3 py-2"
							name="email"
							placeholder="usuario@empresa.com"
							required
							type="email"
						/>
					</label>
					<label className="grid gap-1 text-sm">
						<span className="font-medium text-slate-700">Rol</span>
						<select
							className="rounded-md border border-slate-200 px-3 py-2"
							defaultValue="member"
							name="role"
						>
							<option value="admin">Admin</option>
							<option value="member">Member</option>
							<option value="viewer">Viewer</option>
						</select>
					</label>
					<button
						className="self-end rounded-md bg-[var(--brand-deep)] px-4 py-2 text-sm font-semibold text-white"
						type="submit"
					>
						Invitar
					</button>
				</form>
			) : null}
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
			{invites.length > 0 ? (
				<div className="border-t border-slate-200 p-4">
					<h3 className="text-sm font-semibold text-slate-950">
						Invitaciones pendientes
					</h3>
					<div className="mt-3 grid gap-2">
						{invites.map((invite) => (
							<div
								className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"
								key={invite.id}
							>
								<span className="font-medium text-slate-700">
									{invite.email}
								</span>
								<span className="text-xs uppercase text-slate-500">
									{invite.role} · expira {invite.expires_at.slice(0, 10)}
								</span>
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
	const email = String(formData.get("email") ?? "");
	const password = String(formData.get("password") ?? "");
	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		redirect(`/login?error=${encodeURIComponent(error.message)}`);
	}

	redirect("/workspaces");
}

export async function signUpAction(formData: FormData) {
	const email = String(formData.get("email") ?? "");
	const password = String(formData.get("password") ?? "");
	const fullName = String(formData.get("full_name") ?? "");
	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { full_name: fullName },
		},
	});

	if (error) {
		redirect(`/register?error=${encodeURIComponent(error.message)}`);
	}

	redirect("/onboarding");
}

export async function signOutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/login");
}

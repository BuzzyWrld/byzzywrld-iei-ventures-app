"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession, signIn, signUp } from "@/lib/auth";
import { currentTenant } from "@/lib/current-tenant";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { user, error } = await signIn({ email, password });
  if (error || !user) return { error: error ?? "sign-in failed" };
  await setSession(user.id);
  redirect("/onboarding");
}

export async function signupAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!name) return { error: "name required" };
  const tenant = await currentTenant();
  const { user, error } = await signUp({ email, password, name, tenantId: tenant.id });
  if (error || !user) return { error: error ?? "sign-up failed" };
  await setSession(user.id);
  redirect("/onboarding");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

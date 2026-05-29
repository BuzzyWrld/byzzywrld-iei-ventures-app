import { currentUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";

/** Authenticated account status — drives the Settings page link UI. */
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const row = await findUserById(user.id);
  return Response.json({
    email: user.email,
    name: user.name,
    googleLinked:
      row?.oauth_provider === "google" && !!row?.oauth_provider_account_id,
    hasPassword: !!row?.password_hash,
  });
}

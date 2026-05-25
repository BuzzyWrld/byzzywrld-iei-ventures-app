import { randomUUID } from "node:crypto";

export async function POST() {
  const sessionId = `sess_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  return Response.json({ session_id: sessionId });
}

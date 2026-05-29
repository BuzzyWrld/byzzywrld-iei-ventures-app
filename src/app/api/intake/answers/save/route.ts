import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Autosave endpoint — stores answers in session draft.
  // For now just acknowledge. Full implementation would persist to DB.
  const { session_id, answers } = body;
  return Response.json({ success: true, session_id, saved_keys: Object.keys(answers || {}) });
}

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get("audio") as File | null;
  const sessionId = formData.get("session_id") as string;

  if (!audio) {
    return Response.json({ error: "No audio file provided" }, { status: 400 });
  }

  // In production: stream to Whisper/Deepgram for transcription.
  // For now return a placeholder transcript indicating processing worked.
  return Response.json({
    session_id: sessionId,
    transcript:
      "[Transcript will appear here once speech-to-text is connected. Audio received successfully.]",
    extracted_entities: {},
  });
}

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const sessionId = formData.get("session_id") as string;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // In production: process file through AI extraction pipeline.
  // PDF → text extraction, images → vision model, etc.
  // For now return mock extracted fields based on file type.
  const extracted_fields: Record<string, string> = {};

  if (file.type.includes("pdf")) {
    extracted_fields.industry = "Detected from document";
    extracted_fields.palette_count = "3-5 colors detected";
  } else if (file.type.includes("image")) {
    extracted_fields.logo_type = "Symbol mark detected";
    extracted_fields.dominant_colors = "Analysis pending";
  }

  return Response.json({
    session_id: sessionId,
    file_name: file.name,
    file_size: file.size,
    extracted_fields,
  });
}

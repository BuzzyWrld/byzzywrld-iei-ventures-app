import { NextRequest } from "next/server";
import { scrapeUrl } from "@/lib/scraper";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { url } = (await request.json()) as { url?: string };
  if (!url || !/^https?:\/\//.test(url)) {
    return Response.json({ error: "valid http(s) url required" }, { status: 400 });
  }
  try {
    const result = await scrapeUrl(url);
    return Response.json({ result });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

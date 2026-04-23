/**
 * GET /api/brands/:id/download — stream the brand's entire output dir as a
 * single .zip. Users get every asset in one file: brand.json, PDFs, logo
 * variants, landing variants, social kit, pitch one-pager, email kit.
 */
import { NextRequest } from "next/server";
import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import { getBrand } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { brandDir } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function safeFilename(name: string): string {
  return name
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "brand";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = getBrand(id);
  if (!project) return Response.json({ error: "not found" }, { status: 404 });
  if (project.userId && project.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const dir = brandDir(id);
  if (!fs.existsSync(dir)) {
    return Response.json({ error: "no outputs to download yet" }, { status: 404 });
  }

  // Stream the archiver's output into a ReadableStream that Next can serve.
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const archive = archiver("zip", { zlib: { level: 6 } });

      archive.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));

      // Everything under outputs/<id>/ goes into a branded folder in the zip.
      const folder = safeFilename(project.intake.companyName);
      archive.directory(dir, folder);
      archive.finalize();
    },
  });

  const filename = `${safeFilename(project.intake.companyName)}-brand.zip`;
  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

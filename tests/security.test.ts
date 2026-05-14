/**
 * Security regression tests for the 6 vulnerabilities identified in the
 * senior dev code review (2026-05-14).
 *
 * These tests verify the fixes at the unit level without requiring a
 * running server or database connection.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

// ─── Fix 1: Auth bypass is off by default ───────────────────────────────────

describe("auth bypass", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("DEV_BYPASS defaults to false when env var is unset", async () => {
    delete process.env.DEV_BYPASS;
    // Read the source file and check the logic
    const authSource = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../src/lib/auth.ts"), "utf8")
    );
    // The bypass should read from env, not be hardcoded true
    expect(authSource).toContain('process.env.DEV_BYPASS === "true"');
    expect(authSource).not.toMatch(/const DEV_BYPASS\s*=\s*true/);
  });

  it("proxy auth gate is not commented out", async () => {
    const proxySource = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../src/proxy.ts"), "utf8")
    );
    // The auth gate block should be active code, not comments
    expect(proxySource).toContain("if (isProtected(pathname))");
    expect(proxySource).not.toContain("// if (isProtected(pathname))");
  });
});

// ─── Fix 2: File download routes have ownership checks ──────────────────────

describe("ownership checks", () => {
  it("brand files route imports auth and db for ownership check", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(
        path.join(__dirname, "../src/app/api/brands/[id]/files/[...file]/route.ts"),
        "utf8"
      )
    );
    expect(source).toContain('import { currentUser } from "@/lib/auth"');
    expect(source).toContain('import { getBrand } from "@/lib/db"');
    expect(source).toContain("brand.tenantId !== user.tenantId");
  });

  it("content-engine files route checks ownership", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(
        path.join(__dirname, "../src/app/api/content-engine/[id]/files/[...file]/route.ts"),
        "utf8"
      )
    );
    expect(source).toContain('import { getContentRun } from "@/lib/db"');
    expect(source).toContain("run.tenantId !== user.tenantId");
  });
});

// ─── Fix 3: Brand outputs use Vercel Blob for durability ────────────────────

describe("brand output durability", () => {
  it("storage.ts persists to Blob on write", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../src/lib/storage.ts"), "utf8")
    );
    expect(source).toContain("persistBrandFile");
    expect(source).toContain("readOutputAsync");
    expect(source).toContain("fetchBrandFile");
  });

  it("blob-brands.ts module exists with correct API", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../src/lib/blob-brands.ts"), "utf8")
    );
    expect(source).toContain("export async function persistBrandFile");
    expect(source).toContain("export async function fetchBrandFile");
    expect(source).toContain("export function isBlobEnabled");
  });
});

// ─── Fix 4: Video render path matches storage.ts ────────────────────────────

describe("video render path alignment", () => {
  it("content-engine-runner uses OUTPUTS_ROOT/<brandId> not OUTPUTS_ROOT/brands/<brandId>", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../src/lib/content-engine-runner.ts"), "utf8")
    );
    // Should NOT have the old wrong path
    expect(source).not.toContain('OUTPUTS_ROOT, "brands", brand.id');
    // Should use the correct path matching brandDir()
    expect(source).toContain("OUTPUTS_ROOT, brand.id");
  });

  it("video API route uses OUTPUTS_ROOT/<brandId>", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync(
        path.join(__dirname, "../src/app/api/content-engine/[id]/video/route.ts"),
        "utf8"
      )
    );
    expect(source).not.toContain('OUTPUTS_ROOT, "brands", brand.id');
    expect(source).toContain("OUTPUTS_ROOT, brand.id");
  });
});

// ─── Fix 5: README port matches package.json ────────────────────────────────

describe("documentation accuracy", () => {
  it("README references port 3030 matching package.json", async () => {
    const readme = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../README.md"), "utf8")
    );
    const pkg = await import("fs").then((fs) =>
      fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
    );
    const pkgJson = JSON.parse(pkg);

    // Extract port from dev script
    const devScript: string = pkgJson.scripts.dev;
    const portMatch = devScript.match(/-p\s+(\d+)/);
    const port = portMatch?.[1] ?? "3030";

    expect(readme).toContain(`localhost:${port}`);
    expect(readme).not.toContain("localhost:3000");
  });
});

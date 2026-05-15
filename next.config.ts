import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // turbopack.root prevents the "multiple lockfiles" warning when this project
  // sits inside a larger monorepo-style workspace (e.g. C:\Users\gl3bu\Buzzin).
  turbopack: {
    root: __dirname,
  },
  // Include skill files in the Lambda bundle so they're available at runtime
  // via fs.readFile(path.join(process.cwd(), "skills/..."))
  outputFileTracingIncludes: {
    "/api/brands": ["./skills/brand-playbook/**/*"],
    "/api/brands/[id]/retry": ["./skills/brand-playbook/**/*"],
    "/api/content-engine": ["./skills/content-engine/**/*"],
    "/api/content-engine/[id]": ["./skills/content-engine/**/*"],
    "/api/content-engine/[id]/run-pass": ["./skills/content-engine/**/*"],
  },
};

export default nextConfig;

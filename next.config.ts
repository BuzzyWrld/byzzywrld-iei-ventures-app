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
    "/api/content-engine": ["./skills/**/*"],
    "/api/content-engine/[id]": ["./skills/**/*"],
    "/api/content-engine/[id]/run-pass": ["./skills/**/*"],
  },
};

export default nextConfig;

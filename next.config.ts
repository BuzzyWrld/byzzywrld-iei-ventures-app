import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // turbopack.root prevents the "multiple lockfiles" warning when this project
  // sits inside a larger monorepo-style workspace (e.g. C:\Users\gl3bu\Buzzin).
  turbopack: {
    root: __dirname,
  },
  // Keep the Agent SDK out of the webpack bundle so Node.js resolves it at
  // runtime, allowing it to locate the platform-native CLI binary in
  // node_modules at its expected path.
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
  // Explicitly include the native binaries so Vercel's file-tracing picks
  // them up even though the SDK resolves them via a dynamic require loop.
  outputFileTracingIncludes: {
    "/api/content-engine": [
      "./node_modules/@anthropic-ai/claude-agent-sdk-linux-x64/**",
      "./node_modules/@anthropic-ai/claude-agent-sdk-linux-x64-musl/**",
      "./node_modules/@anthropic-ai/claude-agent-sdk-linux-arm64/**",
      "./node_modules/@anthropic-ai/claude-agent-sdk-linux-arm64-musl/**",
    ],
  },
};

export default nextConfig;

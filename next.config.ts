import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // turbopack.root prevents the "multiple lockfiles" warning when this project
  // sits inside a larger monorepo-style workspace (e.g. C:\Users\gl3bu\Buzzin).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

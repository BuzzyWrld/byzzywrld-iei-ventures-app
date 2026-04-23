import type { NextConfig } from "next";
import os from "node:os";
import path from "node:path";

// Project lives under ~/Documents (iCloud Drive). iCloud's sync engine
// touches files while they're being written, which breaks webpack's
// rename-temp-to-final atomic writes (0.pack.gz_ -> 0.pack.gz fails).
// Move the entire .next build output to a path outside iCloud.
const distDir = path.join(os.homedir(), ".cache", "iei-ventures-next");

const nextConfig: NextConfig = {
  distDir,
};

export default nextConfig;

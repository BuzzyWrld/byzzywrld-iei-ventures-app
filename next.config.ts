import type { NextConfig } from "next";

// Project is inside an iCloud-synced Documents folder. iCloud touches
// files mid-write, breaking webpack's atomic rename pattern (0.pack.gz_
// -> 0.pack.gz fails with ENOENT; routes-manifest.json disappears).
// Appending `.nosync` to the build dir tells iCloud Drive to skip it.
// See: https://support.apple.com/en-us/102651
const nextConfig: NextConfig = {
  distDir: ".next.nosync",
};

export default nextConfig;

import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This app lives in a subdirectory of a repo that has its own lockfile, so
  // the tracing root has to be pinned or Next guesses the parent folder.
  outputFileTracingRoot: here,
};

export default nextConfig;

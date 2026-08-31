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
  // Lets you open the dev server from another device on the same Wi-Fi — handy
  // for checking the mobile layout on a real phone. Without this, Next warns
  // now and will block the request outright in a future major version.
  allowedDevOrigins: ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"],
};

export default nextConfig;

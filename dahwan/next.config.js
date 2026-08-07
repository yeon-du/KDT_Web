/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages serves a project repo's Pages site at
  // https://<user>.github.io/<repo>/ — every asset URL Next.js generates
  // (like /_next/...) needs this prefix or they'll 404 once deployed,
  // since without it they'd resolve against the domain root instead of
  // the /KDT_Web/ subpath.
  basePath: "/KDT_Web",
  assetPrefix: "/KDT_Web",
};

module.exports = nextConfig;

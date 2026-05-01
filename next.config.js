/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",       // Generates static files in /out — required for Capacitor
  trailingSlash: true,    // Ensures routes resolve correctly in native WebView
  reactStrictMode: true,
  images: {
    unoptimized: true,    // next/image optimisation requires a server; disable for static
  },
};

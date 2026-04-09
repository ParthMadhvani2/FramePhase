/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: 'asset/resource',
    });
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // COEP/COOP only on the video editor page — FFmpeg WASM needs SharedArrayBuffer,
      // which requires "cross-origin isolation". We use `credentialless` instead of
      // `require-corp` so cross-origin resources (unpkg ffmpeg-core, S3 video bytes,
      // Google profile images) load without needing a CORP header on the response.
      // Chromium-based browsers (Chrome, Edge, Opera) support `credentialless`;
      // Firefox/Safari fall back to the stricter mode, but the editor page is
      // primarily used on desktop Chrome.
      {
        source: "/:filename([^/]+\\.[^/]+)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

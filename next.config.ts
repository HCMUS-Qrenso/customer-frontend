import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Security Headers Configuration
   * Implements OWASP recommendations for web security
   */
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Referrer-Policy: Prevent token leakage via Referer header
          // strict-origin-when-cross-origin: Send full URL to same origin, only origin to cross-origin
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // X-Content-Type-Options: Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // X-Frame-Options: Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-XSS-Protection: Enable XSS filter (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Permissions-Policy: Disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        // Stricter referrer policy for landing pages with tokens
        source: "/:tenantSlug",
        headers: [
          // no-referrer: Don't send any referrer info for landing pages
          // This is extra protection when token might still be in URL briefly
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
    ];
  },

  /**
   * Rewrites for cleaner URLs (optional future enhancement)
   * Can be used to route short codes to full URLs
   */
  // async rewrites() {
  //   return [];
  // },
};

export default nextConfig;

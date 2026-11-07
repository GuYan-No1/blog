import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  experimental: {
    instantInsights: {
      // 校验降级为警告，不阻断构建
      validationLevel: "manual-warning",
    },
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  output: "standalone",
};

export default nextConfig;

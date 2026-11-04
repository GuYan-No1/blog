import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // 关键：输出 standalone，只打包运行时必需文件，镜像从 ~1GB 压到 ~150MB
  output: "standalone",
};

export default nextConfig;

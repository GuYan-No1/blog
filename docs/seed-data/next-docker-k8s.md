---
title: "Next.js 博客 Docker 打包与 K8s 部署"
date: "2026-11-05"
tag: "云原生"
desc: "腾讯云服务器上 K8s 部署整套博客，包含 Ingress、资源限制。"
---

# Next.js Docker + K8s 部署

## 构建 Docker 镜像

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build
CMD ["pnpm", "--filter", "web", "start"]

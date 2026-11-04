# ---------- 1. 基础镜像 ----------
FROM node:20-alpine AS base
# Intel Mac 上构建 amd64 镜像时，alpine 自带 libc 兼容问题，装一下
RUN apk add --no-cache libc6-compat
# 启用 pnpm corepack
RUN corepack enable

# ---------- 2. 安装依赖（利用 docker 缓存层） ----------
FROM base AS deps
WORKDIR /app
# 先只 copy 依赖描述文件，这一层只要 lock 没变就走缓存
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json
# 安装依赖（frozen-lockfile 保证 CI/构建可复现）
RUN pnpm install --frozen-lockfile

# ---------- 3. 构建 ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 构建 web 子包
RUN pnpm --filter web build

# ---------- 4. 运行时镜像 ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# next standalone 产物结构
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

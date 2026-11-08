---
title: "pnpm monorepo 搭建个人博客踩坑记录"
date: "2026-11-04"
tag: "工程化"
desc: "记录 Next.js + Tailwind v4 monorepo 项目搭建、版本冲突问题。"
---

# pnpm monorepo 搭建踩坑记录

## 背景

最近在搭建个人技术博客，采用 pnpm monorepo 管理，前端用 Next.js 16，后端用 Python FastAPI。

## 坑点一：子目录自动生成 pnpm-workspace.yaml

用 `create-next-app` 初始化 `apps/web` 时，脚手架会自动在子目录生成一份 `pnpm-workspace.yaml`，导致 pnpm 识别异常。

**解决方案**：删掉子目录多余的 workspace 文件，只保留根目录那一份。

## 坑点二：Tailwind v3 vs v4 版本冲突

Next.js 16 默认内置 Tailwind v4 的 Turbopack 集成，如果手动装 v3 会版本打架。

**解决方案**：直接用 Tailwind v4，配置方式改为 `@import "tailwindcss"` + `@theme`。

## 总结

monorepo 搭建要注意：
- 整个仓库只有一份 `pnpm-workspace.yaml`
- 依赖安装统一在根目录执行
- 版本对齐，避免内置插件和手动安装冲突

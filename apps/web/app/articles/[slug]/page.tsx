export const instant = false;

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleDetailAsync from "@/components/ArticleDetailAsync";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articleId = Number(slug);
  if (Number.isNaN(articleId)) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* 静态外壳：返回按钮，预渲染直接输出 */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 font-mono text-xs text-ink-muted
                   transition-colors hover:text-accent"
      >
        ← 返回首页
      </Link>

      {/* 动态区域：Suspense 包裹，加载时显示骨架 */}
      <Suspense fallback={<DetailSkeleton />}>
        <ArticleDetailAsync id={articleId} />
      </Suspense>
    </main>
  );
}

// 骨架屏：近似最终布局，减少视觉跳动
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-bg-surface" />
      <div className="h-10 w-4/5 rounded bg-bg-surface" />
      <div className="h-16 rounded bg-bg-surface" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-bg-surface" />
        <div className="h-4 w-11/12 rounded bg-bg-surface" />
        <div className="h-4 w-10/12 rounded bg-bg-surface" />
      </div>
    </div>
  );
}

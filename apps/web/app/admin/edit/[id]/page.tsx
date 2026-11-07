"use client";

import { Suspense } from "react";
import Link from "next/link";
import EditForm from "./EditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminEditPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">编辑文章</h1>
        <Link
          href="/admin/articles"
          className="text-sm text-ink-muted transition-colors hover:text-accent"
        >
          ← 返回列表
        </Link>
      </div>

      <Suspense fallback={<p className="text-ink-muted">加载中...</p>}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}

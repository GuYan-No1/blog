"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MessageBar from "@/components/ui/MessageBar";

interface ArticleItem {
  id: number | string;
  title: string;
  summary: string;
  created_at?: string;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [list, setList] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ArticleItem | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/articles")
      .then((res) => {
        if (!res.ok) throw new Error("加载失败");
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        setList(data?.data || data?.items || data || []);
      })
      .catch((err) => {
        if (ignore) return;
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "加载失败",
        });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/articles/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");

      setList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage({ type: "success", text: "删除成功" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "删除失败",
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">文章管理</h1>
        <Link
          href="/admin"
          className="text-sm text-ink-muted transition-colors hover:text-accent"
        >
          + 新建文章
        </Link>
      </div>

      {message && (
        <MessageBar
          type={message.type}
          text={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {loading && <p className="text-ink-muted">加载中...</p>}

      {!loading && list.length === 0 && (
        <p className="text-ink-muted">暂无文章，去发布第一篇吧</p>
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-line bg-bg-surface p-5"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                  {item.summary}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <Link
                  href={`/admin/edit/${item.id}`}
                  className="text-ink-muted transition-colors hover:text-accent"
                >
                  编辑
                </Link>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="text-red-400 transition-opacity hover:opacity-80"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="确认删除"
        description={
          deleteTarget
            ? `确定要删除「${deleteTarget.title}」吗？删除后无法恢复。`
            : ""
        }
        confirmText="确认删除"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

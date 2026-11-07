import { FileText } from "lucide-react";
import Link from "next/link";
import ArticleList from "@/components/ArticleList";
import { getArticles } from "@/lib/api";

export default async function ArticlesPage() {
  const articles = await getArticles(1, 20);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      {/* 返回按钮 */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 font-mono text-xs text-ink-muted
                   transition-colors hover:text-accent"
      >
        ← 返回首页
      </Link>

      {/* 页面标题 */}
      <div className="mb-10 flex items-center gap-3">
        <FileText className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-semibold text-ink">全部文章</h1>
      </div>

      {/* 文章列表 */}
      <ArticleList articles={articles} />
    </main>
  );
}

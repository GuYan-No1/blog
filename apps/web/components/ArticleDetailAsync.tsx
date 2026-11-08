import MarkdownRenderer from "@/components/MarkdownRenderer"; // 引入包装组件
import { getArticle } from "@/lib/api";
// import type { ArticleDetail as ArticleDetailType } from "@/lib/types";
// import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  id: number;
}

export default async function ArticleDetailAsync({ id }: Props) {
  const article = await getArticle(id).catch(() => null);
  if (!article) notFound();

  return (
    <article>
      {/* 元信息栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        {article.category && (
          <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-accent">
            {article.category.name}
          </span>
        )}
        <span className="font-mono text-ink-muted">
          {new Date(article.created_at).toLocaleDateString("zh-CN")}
        </span>
        <span className="font-mono text-ink-muted">{article.views} views</span>
      </div>

      {/* 标题 + 摘要 */}
      <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl">
        {article.title}
      </h1>
      <p className="mb-10 border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-ink-muted">
        {article.summary}
      </p>

      {/* 正文 Markdown 渲染 */}
      <div className="prose max-w-none">
        {/* 使用包装后的客户端组件渲染 */}
        <MarkdownRenderer content={article.content} />
      </div>

      {/* 底部标签 */}
      <div className="mt-14 flex flex-wrap gap-2 border-t border-line pt-6">
        {article.tags.map((tag) => (
          <span
            key={tag.id}
            className="rounded-md border border-line bg-bg-elevated px-2.5 py-1 font-mono text-xs text-ink-muted"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </article>
  );
}

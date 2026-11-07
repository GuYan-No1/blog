import Link from "next/link";
import type { ArticleListItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group relative flex flex-col rounded-xl border border-line bg-bg-surface p-6
                 transition-all duration-300
                 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
    >
      {/* 顶部渐变细线，hover 时点亮 */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/0 to-transparent
                       transition-opacity duration-300 group-hover:via-accent/60" />

      {/* 分类 + 日期 */}
      <div className="mb-3 flex items-center gap-3 text-xs">
        {article.category && (
          <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-accent">
            {article.category.name}
          </span>
        )}
        <span className="font-mono text-ink-muted">{formatDate(article.created_at)}</span>
      </div>

      {/* 标题 */}
      <h2 className="mb-2 text-lg font-semibold leading-snug text-ink
                     transition-colors group-hover:text-accent">
        {article.title}
      </h2>

      {/* 摘要 */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-muted">
        {article.summary || "—"}
      </p>

      {/* 标签 + 阅读量 */}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag.id}
            className="rounded-md border border-line bg-bg-elevated px-2 py-0.5 font-mono text-[11px] text-ink-muted"
          >
            #{tag.name}
          </span>
        ))}
        <span className="ml-auto font-mono text-[11px] text-ink-muted">
          {article.views} views
        </span>
      </div>
    </Link>
  );
}

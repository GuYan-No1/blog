import ArticleCard from "./ArticleCard";
import type { ArticleListItem } from "@/lib/types";

export default function ArticleList({ articles }: { articles: ArticleListItem[] }) {
  if (articles?.length > 0) {
    return (
    <div className="grid gap-5 md:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
    );
  }
  return (
      <div className="rounded-xl border border-dashed border-line p-12 text-center">
        <p className="font-mono text-sm text-ink-muted">{"// 暂无文章"}</p>
      </div>
    );

}

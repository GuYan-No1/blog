import { getAllArticles } from "@/lib/articles";
import Link from "next/link";

export default async function ArticleList() {
  const articles = await getAllArticles();
  if (articles.length === 0) {
    return <p className="text-slate-500">暂无文章，或后端服务未启动</p>;
  }
  return (
    <div className="space-y-6">
      {articles.map((item) => (
        <div
          key={item.slug}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition"
        >
          <Link
            href={`/articles/${item.slug}`}
            className="text-xl font-semibold text-slate-900 hover:text-blue-600"
          >
            {item.title}
          </Link>
          <p className="mt-2 text-sm text-slate-500">{item.date} · {item.tag}</p>
          <p className="mt-2 text-slate-600">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

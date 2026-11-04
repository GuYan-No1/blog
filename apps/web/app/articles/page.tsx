import Link from "next/link";
import { BookOpen } from "lucide-react";
import ArticleList from "@/components/ArticleList";
import { Suspense } from "react";

export default async function ArticlesPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 flex items-center gap-2">
        <BookOpen size={28} /> 全部文章
      </h1>
      <Suspense fallback={<p className="text-slate-500">文章加载中...</p>}>
        <ArticleList />
      </Suspense>
      <div className="mt-10">
        <Link href="/" className="text-blue-600 hover:underline">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}

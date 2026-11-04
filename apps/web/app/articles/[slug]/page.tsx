import { Suspense } from "react";
import ArticleDetail from "@/components/ArticleDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function ArticlePage({ params }: Props) {
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <Suspense fallback={
        <div className="py-20 text-center text-slate-500">
          📖 文章加载中...
        </div>
      }>
        <ArticleDetail params={params} />
      </Suspense>
    </main>
  );
}

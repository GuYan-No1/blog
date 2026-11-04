import Link from "next/link";
import { BookOpen } from "lucide-react";
import ArticleList from "@/components/ArticleList";
import ImageUpload from "@/components/ImageUpload";
import { Suspense } from "react";

export default async function HomePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-12">
      <section>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          你好，我是一名前端转AI工程师
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          过往使用 React + Node.js 做全栈开发，熟悉 MySQL、Redis。
          现在学习 Python、LLM、RAG、Agent。这个博客用来沉淀学习笔记，
          同时作为求职作品集。
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen size={24} /> 最新文章
        </h2>
        {/* ✅ Suspense 包裹，加 fallback 占位 */}
        <Suspense fallback={<p className="text-slate-500">文章加载中...</p>}>
          <ArticleList />
        </Suspense>
      </section>

      <section>
        <ImageUpload />
      </section>
    </main>
  );
}

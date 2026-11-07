import ArticleList from "@/components/ArticleList";
import { getArticles } from "@/lib/api";

export default async function HomePage() {
  const articles = await getArticles(1, 12);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      {/* 站点头部 */}
      <header className="mb-14">
        <p className="mb-3 font-mono text-xs tracking-widest text-accent">
          {"// BUILD · SHIP · WRITE"}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
          xmoekr<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
          过往使用 React + Node.js 做全栈开发，熟悉 MySQL、Redis。
          现在学习 Python、LLM、RAG、Agent。这个博客用来沉淀学习笔记，
          同时作为求职作品集。
        </p>
      </header>

      {/* 文章列表区 */}
      <section>
        <h2 className="mb-6 flex items-center gap-3 text-sm font-medium text-ink-muted">
          <span className="h-px flex-1 bg-line" />
          最新文章
          <span className="h-px flex-1 bg-line" />
        </h2>
        <ArticleList articles={articles} />
      </section>
    </main>
  );
}

import { Code2, Database, BrainCog, Server } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-ink">关于我</h1>

      {/* 简介卡片 */}
      <div className="mb-6 rounded-xl border border-line bg-bg-surface p-6">
        <p className="mb-3 font-mono text-xs text-accent">{"// 简介"}</p>
        <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
          <p>
            一名深耕全栈开发的工程师，擅长基于 React + Node.js 构建业务系统、后台管理与中后台项目，具备完整的 MySQL、Redis 数据层设计与调优经验。
          </p>
          <p>
            目前聚焦 LLM 应用落地，基于 Python 技术栈完成过多款 Agent 系统与 RAG 知识库的设计与开发，能够独立完成从前端交互到后端服务、再到大模型能力封装的全链路实现。
          </p>
          <p>
            本博客用于沉淀技术实践与项目复盘，记录工程落地过程中的思考与总结。
          </p>
        </div>
      </div>

      {/* 技术栈卡片 */}
      <div className="mb-6 rounded-xl border border-line bg-bg-surface p-6">
        <p className="mb-4 font-mono text-xs text-accent">{"// 技术栈"}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-ink">前端 & 全栈</p>
              <p className="mt-1 text-xs text-ink-muted">React, Next.js, TypeScript, Node.js</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-ink">存储</p>
              <p className="mt-1 text-xs text-ink-muted">MySQL, Redis, MinIO</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BrainCog className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-ink">AI 方向</p>
              <p className="mt-1 text-xs text-ink-muted">Python, LLM, RAG, Agent, LangChain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Server className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-ink">运维 & 部署</p>
              <p className="mt-1 text-xs text-ink-muted">Docker, K8s, Linux, Nginx</p>
            </div>
          </div>
        </div>
      </div>

      {/* 项目目标卡片 */}
      <div className="mb-10 rounded-xl border border-line bg-bg-surface p-6">
        <p className="mb-3 font-mono text-xs text-accent">{"// 项目目标"}</p>
        <ul className="space-y-2 text-sm text-ink-muted">
          <li>· 基于 Next.js + Tailwind v4 搭建个人博客</li>
          <li>· Markdown 管理文章，支持代码块、图片</li>
          <li>· 使用 MinIO 自建对象存储，替代腾讯云COS</li>
          <li>· Docker 容器化、K8s 云上部署</li>
          <li>· 后续扩展：RAG 知识库、AI 文章助手</li>
        </ul>
      </div>

      {/* 底部链接 */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted
                     transition-colors hover:text-accent"
        >
          ← 返回首页
        </Link>
        <a
          href="https://github.com/GuYan-No1/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs text-ink-muted
                     transition-colors hover:text-accent"
        >
          GitHub
        </a>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Code, Brain, Server, Database } from "lucide-react";
import { Github } from "lucide-brands";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">关于我</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">简介</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          一名前端/全栈工程师，正在转型 AI 应用开发。过往长期使用 React + Node.js 做业务系统、后台管理、中后台全栈项目，熟悉 MySQL、Redis 数据层开发。
        </p>
        <p className="text-slate-600 leading-relaxed">
          现阶段主攻 Python、LLM 应用开发、Agent 开发、RAG 知识库。本博客既是知识沉淀，也是求职作品集，记录从前端到 AI 应用方向的学习踩坑。
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">技术栈</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Code className="text-blue-600 mt-1" size={20} />
            <div>
              <div className="font-medium">前端 & 全栈</div>
              <div className="text-sm text-slate-500">React, Next.js, TypeScript, Node.js</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="text-blue-600 mt-1" size={20} />
            <div>
              <div className="font-medium">存储</div>
              <div className="text-sm text-slate-500">MySQL, Redis, MinIO</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Brain className="text-blue-600 mt-1" size={20} />
            <div>
              <div className="font-medium">AI 方向</div>
              <div className="text-sm text-slate-500">Python, LLM, RAG, Agent, LangChain</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Server className="text-blue-600 mt-1" size={20} />
            <div>
              <div className="font-medium">运维 & 部署</div>
              <div className="text-sm text-slate-500">Docker, K8s, Linux, Nginx</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">项目目标</h2>
        <ul className="space-y-2 text-slate-600">
          <li>• 基于 Next.js + Tailwind v4 搭建个人博客</li>
          <li>• Markdown 管理文章，支持代码块、图片</li>
          <li>• 使用 MinIO 自建对象存储，替代腾讯云COS</li>
          <li>• Docker 容器化、K8s 云上部署</li>
          <li>• 后续扩展：RAG 知识库、AI 文章助手</li>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/" className="text-blue-600 hover:underline">← 返回首页</Link>
        <a href="https://github.com/xxx" target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
          <Github size={16} /> GitHub
        </a>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import Mermaid from "./Mermaid";

export default function MarkdownRenderer({ content }: { content: string }) {
  // 动态注入高亮主题
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    // 这里可以根据你的主题切换逻辑动态加载对应的 CSS
    // 如果使用了 data-theme 属性，可以这样判断：
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    link.href = isDark
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []); // 如果你有全局主题 Context，可以在这里把主题作为依赖项，实现无刷新切换

  const components: Partial<Components> = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      if (match && match[1] === "mermaid") {
        return <Mermaid chart={String(children).replace(/\n$/, "")} />;
      }

      if (!match && !String(children).includes("\n")) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

mermaid.initialize({
  startOnLoad: false, // 关闭自动渲染，由 useEffect 手动触发
  theme: "default", // 跟随浏览器主题
  securityLevel: "loose", // 允许渲染链接等
});

export default function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 生成唯一 id 避免冲突
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        console.error("Mermaid 渲染失败", err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-red-500">图表渲染错误：${err.message}</div>`;
        }
      });
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center my-6 overflow-x-auto"
    />
  );
}

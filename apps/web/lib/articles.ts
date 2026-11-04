import { unstable_noStore } from "next/cache";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  tag: string;
  desc: string;
}

export interface ArticleDetail extends ArticleMeta {
  content: string;
}

// 从后端API获取文章列表
export async function getAllArticles(): Promise<ArticleMeta[]> {
  unstable_noStore(); // ✅ 标记：这个函数不要缓存，动态执行
  const res = await fetch(`${API_BASE}/articles/`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("API 请求失败，回退空列表");
    return [];
  }
  const json = await res.json();
  return json.data || [];
}

// 从后端API获取单篇文章
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  unstable_noStore(); // ✅ 标记：这个函数不要缓存，动态执行
  const res = await fetch(`${API_BASE}/articles/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

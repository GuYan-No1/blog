import type { ArticleDetail, ArticleListItem } from "./types";

// 服务端走内网 Service，客户端走公网 HTTPS
const isServer = typeof window === "undefined";
const BASE_URL = isServer
  ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
  : process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    // 原生缓存配置：600 秒 = 10 分钟
    // 满足 Cache Components 校验，支持即时导航
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
  return (await res.json()) as T;
}

/** 获取文章列表 */
export function getArticles(page = 1, pageSize = 10) {
  return getJSON<ArticleListItem[]>(`/articles?page=${page}&page_size=${pageSize}`);
}

/** 获取文章详情 */
export function getArticle(id: number) {
  return getJSON<ArticleDetail>(`/articles/${id}`);
}

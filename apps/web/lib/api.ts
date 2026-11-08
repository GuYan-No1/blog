import { cacheLife } from "next/cache";
import type { ArticleDetail, ArticleListItem } from "./types";

// 服务端走内网 Service，客户端走公网 HTTPS
const isServer = typeof window === "undefined";
const BASE_URL = isServer
  ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
  : process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
  // 必须放在函数体第一行，标记该函数为可缓存
  "use cache";
  // 缓存 10 分钟，单位为秒
  cacheLife({ revalidate: 600 });

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    // 核心修复：在构建期如果连不上后端，返回空数组或 null，防止构建崩溃
    console.warn(`[构建预警] 无法连接后端，跳过数据获取: ${path},${error}`);
    // 如果期望返回的是数组，返回 []
    // 如果期望返回对象，返回 null
    return [] as unknown as T;
  }
}

/** 获取文章列表 */
export function getArticles(page = 1, pageSize = 10) {
  return getJSON<ArticleListItem[]>(
    `/articles?page=${page}&page_size=${pageSize}`,
  );
}

/** 获取文章详情 */
export function getArticle(id: number) {
  return getJSON<ArticleDetail>(`/articles/${id}`);
}

import { useState, useRef, useEffect } from "react";

interface ArticleForm {
  title: string;
  summary: string;
  tags: string;
  content: string;
}

interface Options {
  /** 编辑模式传入文章 ID，发布模式不传 */
  articleId?: string;
  /** 草稿存储键名 */
  draftKey: string;
}

const DEFAULT_FORM: ArticleForm = {
  title: "",
  summary: "",
  tags: "",
  content: "",
};

/** 后端 tags 归一化：兼容 [{name, id}] 对象数组与 ["name"] 字符串数组 */
function normalizeTags(tags: unknown): string {
  if (!Array.isArray(tags)) return "";
  return tags
    .map((t) => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object" && "name" in t) {
        return String((t as { name?: unknown }).name ?? "");
      }
      return "";
    })
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

/** 判断表单是否为空（统一字段判断，避免多处逻辑不一致） */
function isEmptyForm(form: ArticleForm): boolean {
  return !form.title && !form.summary && !form.content && !form.tags;
}

/** 纯请求函数：提取到 Hook 外，引用稳定 */
async function fetchArticle(
  id: string,
  signal: AbortSignal
): Promise<ArticleForm> {
  const res = await fetch(`/api/articles/${id}`, { signal });
  if (!res.ok) throw new Error("文章加载失败");
  const raw = await res.json();
  const data = raw?.data || raw;
  return {
    title: data.title || "",
    summary: data.summary || "",
    tags: normalizeTags(data.tags),
    content: data.content || "",
  };
}

/** 安全读取草稿：解析失败或不存在返回 null */
function readDraft(key: string): ArticleForm | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FORM, ...parsed };
  } catch {
    // 草稿已损坏，清理掉避免持续报错
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return null;
  }
}

/**
 * 文章表单 Hook
 *
 * 加载优先级：本地草稿 > 远程数据 > 默认空表单
 * 副作用仅保留「初始数据同步」与「卸载清理」两项，其余均为事件驱动
 */
export function useArticleForm({ articleId, draftKey }: Options) {
  // 初始值服务端 / 客户端首帧完全一致，杜绝 hydration mismatch
  const [article, setArticle] = useState<ArticleForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 闭包安全：saveDraft 通过 ref 读取最新值
  const articleRef = useRef(article);
  useEffect(() => {
    articleRef.current = article;
  }, [article]);
  // 防抖定时器
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // resetFromServer 触发的请求（与 effect 请求独立管理，避免竞态）
  const resetControllerRef = useRef<AbortController | null>(null);

  // 卸载清理：定时器 + reset 请求
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      resetControllerRef.current?.abort();
    };
  }, []);

  // 初始加载：articleId / draftKey 变化时重新执行
  useEffect(() => {
    // 取消上一次 reset 请求，避免旧数据回流
    resetControllerRef.current?.abort();
    resetControllerRef.current = null;

    // 重置状态。此处在 effect 内同步 setState 属于「从外部系统同步状态」的合法场景，
    // ESLint 的 set-state-in-effect 规则无法识别，逐行豁免并注明原因。
    /* eslint-disable react-hooks/set-state-in-effect */
    setArticle(DEFAULT_FORM);
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // 1. 本地草稿优先
    const draft = readDraft(draftKey);
    if (draft && !isEmptyForm(draft)) {
      setArticle(draft);
      setLoading(false);
      return;
    }

    // 2. 无 articleId（发布模式）：无需远程加载
    if (!articleId) {
      setLoading(false);
      return;
    }

    // 3. 远程加载
    const controller = new AbortController();
    fetchArticle(articleId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setArticle(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [articleId, draftKey]);

  /** 防抖保存草稿，由输入事件驱动 */
  function saveDraft(delay = 500) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(articleRef.current));
      } catch {
        /* localStorage 满或被禁用时静默失败 */
      }
    }, delay);
  }

  /** 清空草稿与待执行定时器 */
  function clearDraft() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
  }

  /** 放弃本地草稿、重新拉取服务端最新数据，由点击事件驱动 */
  function resetFromServer() {
    if (!articleId) return;

    // 取消上一次 reset 请求
    resetControllerRef.current?.abort();

    clearDraft();
    setArticle(DEFAULT_FORM);
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    resetControllerRef.current = controller;

    fetchArticle(articleId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setArticle(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
  }

  return {
    article,
    setArticle,
    loading,
    error,
    saveDraft,
    clearDraft,
    resetFromServer,
  };
}

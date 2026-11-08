"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useArticleForm } from "@/hooks/use-article-form";
import { useMounted } from "@/hooks/use-mounted";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MessageBar from "@/components/ui/MessageBar";
import ImageUpload from "@/components/ui/ImageUpload";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditForm({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const mounted = useMounted();
  const draftKey = `admin-draft-${id}`;
  const { article, setArticle, loading, error, saveDraft, clearDraft, resetFromServer } = useArticleForm({
    articleId: id,
    draftKey,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // 记录光标选区位置，用于精准插入图片
  function recordCursor() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.dataset.cursorStart = String(textarea.selectionStart);
    textarea.dataset.cursorEnd = String(textarea.selectionEnd);
  }

  // 上传成功后在光标处插入标准 Markdown 图片语法
  function handleImageUploaded({ url, key: _key }: { url: string; key: string }) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = Number(textarea.dataset.cursorStart ?? article.content.length);
    const end = Number(textarea.dataset.cursorEnd ?? article.content.length);
    const imageMd = `![图片](${url})`;

    const newContent = article.content.slice(0, start) + imageMd + article.content.slice(end);
    setArticle({ ...article, content: newContent });
    saveDraft();

    // 插入后将光标定位到图片语法末尾
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + imageMd.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);

    try {
      const tagList = (article.tags || "")
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          tags: tagList,
        }),
      });

      if (!res.ok) throw new Error("保存失败，请检查参数或稍后重试");

      clearDraft();
      setMessage({ type: "success", text: "保存成功，即将跳转文章列表" });

      setTimeout(() => {
        router.push("/admin/articles");
        router.refresh();
      }, 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "保存失败",
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  function confirmReset() {
    resetFromServer();
    setResetModalOpen(false);
    setMessage({ type: "success", text: "已恢复为服务端原始内容" });
    setTimeout(() => setMessage(null), 3000);
  }

  if (!mounted || loading) {
    return <p className="text-ink-muted">加载中...</p>;
  }

  return (
    <>
      {error && (
        <MessageBar type="error" text={error} onClose={() => {}} duration={0} />
      )}

      {message && (
        <MessageBar
          type={message.type}
          text={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {/* 左侧：编辑区 */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">标题</label>
            <input
              type="text"
              value={article.title}
              onChange={(e) => {
                setArticle({ ...article, title: e.target.value });
                saveDraft();
              }}
              className="w-full rounded-lg border border-line bg-bg-surface px-4 py-3 text-ink
                         outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">摘要</label>
            <textarea
              value={article.summary}
              onChange={(e) => {
                setArticle({ ...article, summary: e.target.value });
                saveDraft();
              }}
              rows={2}
              className="w-full resize-none rounded-lg border border-line bg-bg-surface px-4 py-3 text-ink
                         outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink">
                正文（Markdown）
              </label>
              <div className="flex items-center gap-3">
                <ImageUpload onSuccess={handleImageUploaded} />
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-ink-muted transition-colors hover:text-accent"
                >
                  恢复原文
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              onClick={recordCursor}
              onKeyUp={recordCursor}
              onSelect={recordCursor}
              value={article.content}
              onChange={(e) => {
                setArticle({ ...article, content: e.target.value });
                saveDraft();
              }}
              rows={22}
              className="w-full resize-y rounded-lg border border-line bg-bg-surface px-4 py-3 font-mono text-sm text-ink
                         outline-none transition-colors focus:border-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">标签（逗号分隔）</label>
            <input
              type="text"
              value={article.tags}
              onChange={(e) => {
                setArticle({ ...article, tags: e.target.value });
                saveDraft();
              }}
              className="w-full rounded-lg border border-line bg-bg-surface px-4 py-3 text-ink
                         outline-none transition-colors focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full rounded-lg bg-accent py-3 font-medium text-bg-base
                       transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLoading ? "保存中..." : "保存修改"}
          </button>
        </div>

        {/* 右侧：实时预览区 */}
        <div className="rounded-xl border border-line bg-bg-surface p-6">
          <p className="mb-4 font-mono text-xs text-accent">{"// 预览"}</p>
          <div className="prose h-full max-h-[720px] overflow-y-auto pr-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </form>

      <ConfirmModal
        open={resetModalOpen}
        title="恢复原文"
        description="确定要放弃当前编辑内容，恢复为服务端原始版本吗？未保存的修改会丢失。"
        confirmText="确认恢复"
        onConfirm={confirmReset}
        onCancel={() => setResetModalOpen(false)}
      />
    </>
  );
}

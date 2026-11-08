"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  /** 上传成功回调，返回完整图片信息（url 用于展示，key 用于后续删除） */
  onSuccess: (result: { url: string; key: string }) => void;
  /** 接受的文件类型，默认与后端白名单对齐 */
  accept?: string;
  /** 单文件最大体积，单位字节，默认 5MB */
  maxSize?: number;
  /** 上传失败回调，返回错误信息，由父组件决定展示方式 */
  onError?: (message: string) => void;
}

/**
 * 后台图片上传组件
 * 单文件上传，内置前置校验、错误分层处理、请求取消能力、成功反馈
 * 仅依赖原生 Web API，无第三方依赖
 */
export default function ImageUpload({
  onSuccess,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSize = 5 * 1024 * 1024,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 卸载时取消未完成请求、清理定时器
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // 显示错误信息，3 秒后自动消失
  function showError(message: string) {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(message);
    onError?.(message);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 3000);
  }

  // 显示成功反馈，1.5 秒后自动消失
  function showSuccess() {
    setSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(false), 1500);
  }

  async function uploadFile(file: File) {
    // 前置类型校验（防止 accept 被绕过）
    if (!file.type.startsWith("image/")) {
      showError("仅支持上传图片文件");
      return;
    }
    // 前置大小校验（体验优化，真正的安全兜底在后端）
    if (file.size > maxSize) {
      const sizeMb = (maxSize / 1024 / 1024).toFixed(0);
      showError(`文件大小超过限制（最大 ${sizeMb}MB）`);
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 同源请求自动带 Cookie，无需手动读 token
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        credentials: "same-origin",
      });

      // HTTP 非 2xx：优先读后端 message 字段
      if (!res.ok) {
        let errMsg = `上传失败（HTTP ${res.status}）`;
        try {
          const errResult = (await res.json()) as { message?: string };
          if (typeof errResult?.message === "string") {
            errMsg = errResult.message;
          }
        } catch {
          // 后端返回 HTML 错误页 / 空 body，用默认提示
        }
        throw new Error(errMsg);
      }

      // 解析成功响应
      let result: unknown;
      try {
        result = await res.json();
      } catch {
        throw new Error("服务器返回格式异常");
      }

      // 校验平铺结构的 { url, key }
      const data = result as { url?: unknown; key?: unknown };
      if (typeof data?.url !== "string" || typeof data?.key !== "string") {
        throw new Error("上传成功但未返回完整图片信息");
      }

      onSuccess({ url: data.url, key: data.key });
      showSuccess();
    } catch (err) {
      // 主动取消的请求静默处理
      if (err instanceof Error && err.name === "AbortError") return;

      // 区分网络层错误（TypeError）和业务层错误
      if (err instanceof TypeError) {
        showError("网络异常，请检查网络连接");
      } else if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("上传失败，请稍后重试");
      }
    } finally {
      if (!controller.signal.aborted) {
        setUploading(false);
      }
      // 重置 input，允许重复上传同名文件
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadFile(file);
  }

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="上传图片"
        aria-busy={uploading}
        className="text-xs text-ink-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "上传中..." : success ? "上传成功" : "上传图片"}
      </button>

      {errorMsg && (
        <div
          role="alert"
          className="absolute left-0 top-full mt-1 max-w-xs rounded border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-400"
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

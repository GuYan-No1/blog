"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  /** 上传成功回调，返回图片访问URL */
  onSuccess: (url: string) => void;
  /** 接受的文件类型，默认所有图片格式 */
  accept?: string;
  /** 单文件最大体积，单位字节，默认 5MB */
  maxSize?: number;
  /** 上传失败回调，返回错误信息，由父组件决定展示方式 */
  onError?: (message: string) => void;
}

/**
 * 后台图片上传组件
 * 单文件上传，内置前置校验、错误分层处理、请求取消能力
 * 仅依赖原生 Web API，无第三方依赖
 */
export default function ImageUpload({
  onSuccess,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 卸载时取消未完成请求、清理定时器
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  // 显示错误信息，3秒后自动消失
  function showError(message: string) {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(message);
    onError?.(message);
    errorTimerRef.current = setTimeout(() => {
      setErrorMsg(null);
    }, 3000);
  }

  // 执行上传请求
  async function uploadFile(file: File) {
    // 前置类型校验
    if (!file.type.startsWith("image/")) {
      showError("仅支持上传图片文件");
      return;
    }
    // 前置大小校验
    if (file.size > maxSize) {
      const sizeMb = (maxSize / 1024 / 1024).toFixed(0);
      showError(`文件大小超过限制（最大 ${sizeMb}MB）`);
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    // 取消上一次未完成的请求
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      // HTTP 状态码错误
      if (!res.ok) {
        let errMsg = `上传失败（HTTP ${res.status}）`;
        try {
          const errResult = await res.json();
          if (typeof errResult?.message === "string") {
            errMsg = errResult.message;
          } else if (typeof errResult?.error === "string") {
            errMsg = errResult.error;
          }
        } catch {
          // 错误响应无法解析为 JSON，使用默认提示
        }
        throw new Error(errMsg);
      }

      // 解析响应数据
      let result: Record<string, unknown>;
      try {
        result = await res.json();
      } catch {
        throw new Error("服务器返回格式异常");
      }

      // 提取图片 URL
      const data = result.data as Record<string, unknown> | undefined;
      const url = (data?.url ?? result.url) as string | undefined;
      if (!url || typeof url !== "string") {
        throw new Error("上传成功但未返回图片地址");
      }

      onSuccess(url);
    } catch (err) {
      // 主动取消的请求不提示错误
      if (err instanceof Error && err.name === "AbortError") return;

      // 网络层面错误（断网、跨域等）
      if (err instanceof Error && err.message) {
        showError(err.message);
      } else {
        showError("网络异常，请稍后重试");
      }
    } finally {
      if (!controller.signal.aborted) {
        setUploading(false);
      }
      // 重置文件输入，允许重复上传同一文件
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
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
        {uploading ? "上传中..." : "上传图片"}
      </button>

      {errorMsg && (
        <div className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs text-red-400">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";

interface ImageUploadProps {
  /** 上传成功回调，返回完整公网URL与MinIO内部key */
  onSuccess: (result: { url: string; key: string }) => void;
  /** 上传失败回调，返回人类可读的错误信息，父组件可用于展示toast */
  onError?: (message: string) => void;
  /** 允许的文件类型，默认与后端白名单对齐 */
  accept?: string;
  /** 单文件最大体积，单位字节，默认5MB，仅前端预校验 */
  maxSize?: number;
  /** 按钮展示文案 */
  label?: string;
  /** 是否禁用按钮，由父组件控制 */
  disabled?: boolean;
  /** 自定义获取Bearer token的方法，跨域场景使用；默认依赖Cookie鉴权 */
  getToken?: () => string | null;
}

/**
 * 后台图片上传组件
 * 前置校验文件大小与类型，支持拖拽上传，自动处理加载态、错误提示与卸载取消
 * 默认调用同源 /api/admin/upload 中转接口，依赖 Cookie 鉴权
 */
export default function ImageUpload({
  onSuccess,
  onError,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSize = 5 * 1024 * 1024,
  label = "上传图片",
  disabled = false,
  getToken,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 组件卸载时取消请求、清理定时器
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 展示状态文案，默认3秒自动消失
  function showError(message: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setErrorMsg(message);
    onError?.(message);
    timerRef.current = setTimeout(() => {
      setErrorMsg(null);
    }, 3000);
  }

  async function uploadFile(file: File) {
    // 前置校验：空文件
    if (file.size === 0) {
      showError("文件不能为空");
      return;
    }
    // 前置校验：文件大小
    if (file.size > maxSize) {
      const sizeMb = (maxSize / 1024 / 1024).toFixed(0);
      showError(`文件大小不能超过 ${sizeMb}MB`);
      return;
    }
    // 前置校验：文件类型
    if (!file.type.startsWith("image/")) {
      showError("只支持图片文件");
      return;
    }
    // 防重复提交
    if (uploading) return;

    setUploading(true);
    setErrorMsg(null);

    // 取消上一次未完成的请求
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {};
      const token = getToken?.();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      // 解析响应，处理非JSON错误页
      let result: Record<string, unknown>;
      try {
        result = await res.json();
      } catch {
        throw new Error("服务器返回格式异常");
      }

      // HTTP错误，优先读后端message
      if (!res.ok) {
        const message =
          typeof result.message === "string"
            ? result.message
            : `上传失败（HTTP ${res.status}）`;
        throw new Error(message);
      }

      // 校验返回字段完整性
      const url = result.url;
      const key = result.key;
      if (typeof url !== "string" || typeof key !== "string") {
        throw new Error("上传成功但未返回图片地址");
      }

      onSuccess({ url, key });
    } catch (err) {
      // 主动取消的请求不提示、不更新状态
      if (err instanceof Error && err.name === "AbortError") return;

      let message = "上传失败，请稍后重试";
      if (err instanceof Error && err.message) {
        message = err.message;
      } else {
        message = "网络异常，请检查网络连接";
      }
      showError(message);
    } finally {
      // 未取消的请求才更新状态，避免卸载后setState
      if (!controller.signal.aborted) {
        setUploading(false);
      }
      // 重置input，允许重复上传同名文件
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  // 拖拽上传处理
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
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
        disabled={uploading || disabled}
        aria-label={label}
        aria-busy={uploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isDragging ? "text-accent" : "text-ink-muted hover:text-accent"
        }`}
      >
        {uploading ? "上传中..." : label}
      </button>

      {errorMsg && (
        <div
          role="alert"
          className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs text-red-400"
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

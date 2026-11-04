"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setImageUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.detail || "上传失败");
        return;
      }

      const url = json.data.url;
      setImageUrl(url);

      // 自动复制 markdown 图片语法到剪贴板，写文章直接粘贴
      const markdown = `![${file.name}](${url})`;
      await navigator.clipboard.writeText(markdown);
    } catch (err) {
      setError("网络错误，后端服务是否启动？");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-3">图片上传（自动复制 Markdown 语法）</h3>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-slate-600
          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
          file:bg-blue-600 file:text-white file:text-sm file:font-medium
          hover:file:bg-blue-700 file:cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {uploading && <p className="mt-3 text-sm text-slate-500">上传中...</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="预览"
            className="max-w-full h-auto rounded-lg border border-slate-200"
          />
          <p className="mt-2 text-sm text-slate-500">
            ✅ 已自动复制 Markdown 语法到剪贴板，可直接粘贴到文章里
          </p>
          <code className="block mt-2 p-2 bg-slate-100 rounded text-xs text-slate-700 break-all">
            {imageUrl}
          </code>
        </div>
      )}
    </div>
  );
}

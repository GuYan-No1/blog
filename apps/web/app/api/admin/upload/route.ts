/**
 * 后台图片上传转发路由
 * 设计边界：仅做请求鉴权、基础文件校验与上游服务转发，不存储文件、不做图片加工、不做病毒扫描
 * CSRF 防护：依赖 admin_token Cookie 的 SameSite 属性实现；若 Cookie 配置为 SameSite=None，需补充 CSRF Token 校验
 */
import { NextResponse,type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 单文件最大 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UPLOAD_TIMEOUT = 30_000; // 上游请求超时 30秒

/**
 * 净化文件名：移除路径分隔符、控制字符，限制长度，避免路径遍历与异常字符
 */
function sanitizeFilename(name: string): string {
  let safe = name.replace(/[\\/]/g, "_").replace(/[\x00-\x1F\x7F]/g, "");
  // 总长度限制 200 字符，保留后缀
  if (safe.length > 200) {
    const extIndex = safe.lastIndexOf(".");
    if (extIndex > 0) {
      const ext = safe.slice(extIndex);
      safe = safe.slice(0, 200 - ext.length) + ext;
    } else {
      safe = safe.slice(0, 200);
    }
  }
  return safe.trim() || "upload";
}

export async function POST(request: NextRequest) {
  // 1. 前置 Content-Type 校验
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ message: "请求格式不支持" }, { status: 415 });
  }

  // 2. 前置 Content-Length 校验，避免大请求体撑爆内存
  const contentLengthStr = request.headers.get("content-length");
  if (contentLengthStr) {
    const contentLength = Number(contentLengthStr);
    if (!Number.isNaN(contentLength) && contentLength > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "文件过大" }, { status: 413 });
    }
  }

  // 3. 鉴权校验
  const adminSecret = process.env.ADMIN_SECRET;
  const token = request.cookies.get("admin_token")?.value;

  if (adminSecret && (!token || !(await verifyToken(token, adminSecret)))) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // 4. 文件基础校验
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "无效的文件参数" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ message: "文件不能为空" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "文件过大" }, { status: 413 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "不支持的文件类型" }, { status: 415 });
    }

    // 5. 文件名净化，构造新的转发 FormData
    const safeName = sanitizeFilename(file.name);
    const forwardFormData = new FormData();
    forwardFormData.append("file", new File([file], safeName, { type: file.type }));

    // 6. 上游地址合法性校验
    const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      console.error("[Upload] 上游接口地址未配置");
      return NextResponse.json({ message: "上传服务暂不可用" }, { status: 500 });
    }
    try {
      new URL(apiBase);
    } catch {
      console.error("[Upload] 上游接口地址格式非法:", apiBase);
      return NextResponse.json({ message: "上传服务暂不可用" }, { status: 500 });
    }

    // 7. 转发到上游服务，带超时控制
    const uploadRes = await fetch(`${apiBase}/upload`, {
      method: "POST",
      body: forwardFormData,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT),
    });

    // 8. 上游响应处理
    let result: Record<string, unknown>;
    try {
      result = await uploadRes.json();
    } catch {
      console.error("[Upload] 上游返回非 JSON 格式，状态码:", uploadRes.status);
      return NextResponse.json({ message: "上传服务响应异常" }, { status: 502 });
    }

    // 上游业务错误，透传明确的业务提示
    if (!uploadRes.ok) {
      const errMsg =
        typeof result.message === "string" ? result.message : "上传失败，请稍后重试";
      return NextResponse.json({ message: errMsg }, { status: uploadRes.status });
    }

    // 9. 校验上游返回的图片地址
    const data = result.data as Record<string, unknown> | undefined;
    const url = (data?.url ?? result.url) as string | undefined;
    if (!url || typeof url !== "string") {
      console.error("[Upload] 上游未返回有效图片地址，响应:", result);
      return NextResponse.json({ message: "上传服务响应异常" }, { status: 502 });
    }

    return NextResponse.json(result, { status: uploadRes.status });
  } catch (err) {
    // 超时错误
    if (err instanceof Error && err.name === "TimeoutError") {
      console.error("[Upload] 上游请求超时");
      return NextResponse.json({ message: "上传超时" }, { status: 504 });
    }
    // 网络层面错误（连接失败、断网等）
    if (err instanceof Error && err.message.includes("fetch failed")) {
      console.error("[Upload] 上游服务不可达:", err.message);
      return NextResponse.json({ message: "上传服务暂不可用" }, { status: 502 });
    }
    // 其余内部错误
    console.error("[Upload] 上传处理异常:", err);
    return NextResponse.json({ message: "上传失败，请稍后重试" }, { status: 500 });
  }
}

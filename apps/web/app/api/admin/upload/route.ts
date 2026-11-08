import { NextResponse,type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // 后台鉴权校验，与页面体系对齐
  const adminSecret = process.env.ADMIN_SECRET;
  const token = request.cookies.get("admin_token")?.value;

  if (adminSecret && (!token || !(await verifyToken(token, adminSecret)))) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const apiBase = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      console.error("[Upload] API_INTERNAL_URL 或 NEXT_PUBLIC_API_URL 未配置");
      return NextResponse.json({ message: "上传服务暂不可用" }, { status: 500 });
    }

    // 直接透传原始表单数据，不二次解析，减少内存占用
    const formData = await request.formData();

    const uploadRes = await fetch(`${apiBase}/upload/image`, {
      method: "POST",
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(30000),
    });

    // 解析响应，处理上游返回HTML错误页的场景
    let result: Record<string, unknown>;
    try {
      result = await uploadRes.json();
    } catch {
      return NextResponse.json(
        { message: "上传服务响应异常" },
        { status: 502 }
      );
    }

    // 透传上游状态码与完整响应体（含url、key字段）
    return NextResponse.json(result, { status: uploadRes.status });
  } catch (err) {
    // 超时错误单独处理
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json({ message: "上传超时" }, { status: 504 });
    }
    // 网络层错误（断网、DNS失败等）
    console.error("[Upload] 上游请求失败:", err);
    return NextResponse.json(
      { message: "网络异常，请检查网络连接" },
      { status: 502 }
    );
  }
}

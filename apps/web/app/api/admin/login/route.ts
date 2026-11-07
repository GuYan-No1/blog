import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  // 未配置密码时默认放行（本地开发）
  if (!adminPassword || !adminSecret) {
    return NextResponse.json({ success: true });
  }

  const { password } = await request.json();

  if (password !== adminPassword) {
    return NextResponse.json({ message: "密码错误" }, { status: 401 });
  }

  // 生成签名令牌并写入 cookie
  const token = await generateToken(adminSecret);
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 7 * 24 * 60 * 60, // 7天
  });

  return response;
}

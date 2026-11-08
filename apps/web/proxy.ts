import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  // 未配置鉴权参数时放行（本地开发）
  if (!adminPassword || !adminSecret) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  // 登录页白名单，避免无限重定向
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  if (token && (await verifyToken(token, adminSecret))) {
    return NextResponse.next();
  }

  // 令牌无效或不存在，重定向到登录页
  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

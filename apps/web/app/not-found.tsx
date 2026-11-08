"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 每秒更新倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 3 秒后执行跳转
    const redirect = setTimeout(() => {
      router.push("/");
    }, 3000);

    // 组件卸载时清理定时器，防止内存泄漏
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-accent mb-4 tracking-widest">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        页面走丢了
      </h2>
      <p className="text-ink-muted mt-4">你访问的页面不存在或已被移动。</p>
      <p className="text-sm text-ink-muted mt-2">
        <span className="font-bold text-accent">{countdown}</span>{" "}
        秒后将自动返回首页，或者
        <Link href="/" className="text-accent hover:underline ml-1">
          点击这里立即返回
        </Link>
      </p>
    </div>
  );
}

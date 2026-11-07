import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-semibold text-ink">
          xmoekr<span className="text-accent">.dev</span>
        </Link>

        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-6 text-sm text-ink-muted">
            <Link href="/" className="transition-colors hover:text-accent">首页</Link>
            <Link href="/articles" className="transition-colors hover:text-accent">文章</Link>
            <Link href="/about" className="transition-colors hover:text-accent">关于</Link>
          </div>
          <div className="ml-2 border-l border-line pl-4">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

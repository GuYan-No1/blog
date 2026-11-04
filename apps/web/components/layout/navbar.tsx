import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-slate-900">
          TechBlog
        </Link>
        <nav className="space-x-6 text-sm">
          <Link href="/" className="hover:text-blue-600 transition">首页</Link>
          <Link href="/articles" className="hover:text-blue-600 transition">文章</Link>
          <Link href="/about" className="hover:text-blue-600 transition">关于我</Link>
        </nav>
      </div>
    </header>
  );
}

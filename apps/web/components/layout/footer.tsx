export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-ink-muted md:flex-row">
        <p className="font-mono">
          © 2026 xmoekr · Built with Next.js & FastAPI
        </p>
        <p className="font-mono">
          Powered by K3s + PostgreSQL
        </p>
      </div>
    </footer>
  );
}

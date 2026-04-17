import Link from "next/link";
import { BookOpen } from "lucide-react";

export function AuthShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-md flex-col items-stretch px-6 py-10">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-ink-900 text-white">
            <BookOpen className="size-5" />
          </div>
          <span className="text-lg font-bold">Booklog</span>
        </Link>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
        <div className="card mt-6 p-6">{children}</div>
      </div>
    </div>
  );
}

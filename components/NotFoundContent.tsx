"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const content = {
  en: {
    title: "Page not found",
    body: "The page may have moved, or the address may be incorrect.",
    action: "Return to SellerMargin",
  },
  zh: {
    title: "页面未找到",
    body: "该页面可能已移动，或者地址不正确。",
    action: "返回 SellerMargin",
  },
  es: {
    title: "Página no encontrada",
    body: "Es posible que la página se haya movido o que la dirección no sea correcta.",
    action: "Volver a SellerMargin",
  },
} as const;

type NotFoundContentProps = {
  fullScreen?: boolean;
};

export default function NotFoundContent({ fullScreen = false }: NotFoundContentProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const safeLocale = locale === "zh" || locale === "es" ? locale : "en";
  const copy = content[safeLocale];

  return (
    <main
      className={`bg-slate-50 ${
        fullScreen ? "min-h-screen" : "min-h-[60vh] px-4 py-16"
      }`}
    >
      {fullScreen ? (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <Link href="/en" className="flex items-center gap-3" aria-label="SellerMargin">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-ink-950 text-sm font-bold text-white">
                SM
              </span>
              <span className="text-base font-bold text-ink-950">SellerMargin</span>
            </Link>
          </div>
        </header>
      ) : null}

      <div
        className={`grid place-items-center px-4 py-16 ${
          fullScreen ? "min-h-[calc(100vh-4rem)]" : "min-h-[60vh]"
        }`}
      >
        <section className="w-full max-w-2xl text-center">
          {!fullScreen ? (
            <p className="text-sm font-bold text-brand-700">SellerMargin</p>
          ) : null}
          <p className="mt-3 text-sm font-bold uppercase text-brand-700">
            404 <span aria-hidden="true">/</span> {copy.title}
          </p>
          <h1 className="mt-4 text-4xl font-black text-ink-950 sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-ink-500">{copy.body}</p>
          <Link
            href={`/${safeLocale}`}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
          >
            {copy.action}
          </Link>
        </section>
      </div>
    </main>
  );
}

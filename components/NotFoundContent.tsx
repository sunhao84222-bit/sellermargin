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
      className={`grid place-items-center bg-slate-50 px-4 py-16 ${
        fullScreen ? "min-h-screen" : "min-h-[60vh]"
      }`}
    >
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-black text-ink-950">{copy.title}</h1>
        <p className="mt-4 text-sm leading-6 text-ink-500">{copy.body}</p>
        <Link
          href={`/${safeLocale}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
        >
          {copy.action}
        </Link>
      </section>
    </main>
  );
}

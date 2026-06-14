export default function CookieConsentBanner() {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") {
    return null;
  }

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-ink-700 shadow-soft"
      role="status"
    >
      Analytics consent controls are reserved for a future integration. No analytics SDK or
      non-essential cookies are active in this V1 build.
    </aside>
  );
}

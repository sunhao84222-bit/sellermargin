"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Messages } from "@/lib/locales";

type HomeModalProps = {
  messages: Messages;
  eyebrow?: never;
  title?: never;
  body?: never;
  closeLabel?: never;
  ctaLabel?: never;
  ctaHref?: never;
  onClose?: never;
};

type ControlledModalProps = {
  messages?: never;
  eyebrow: string;
  title: string;
  body: string;
  closeLabel: string;
  ctaLabel: string;
  ctaHref: string;
  onClose: () => void;
};

type ProFeatureModalProps = HomeModalProps | ControlledModalProps;

export default function ProFeatureModal(props: ProFeatureModalProps) {
  const [homeOpen, setHomeOpen] = useState(false);
  const titleId = useId();
  const homeTriggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef(true);
  const isHomeModal = "messages" in props && props.messages !== undefined;
  const isOpen = isHomeModal ? homeOpen : true;
  const controlledOnClose = isHomeModal ? undefined : props.onClose;

  const content = isHomeModal
    ? {
        eyebrow: props.messages.home.pro.eyebrow,
        title: props.messages.modal.title,
        body: props.messages.modal.body,
        closeLabel: props.messages.modal.close,
        ctaLabel: props.messages.modal.cta,
        ctaHref: "#waitlist",
        features: props.messages.home.pro.features,
      }
    : {
        eyebrow: props.eyebrow,
        title: props.title,
        body: props.body,
        closeLabel: props.closeLabel,
        ctaLabel: props.ctaLabel,
        ctaHref: props.ctaHref,
        features: [] as string[],
      };

  const close = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;

    if (isHomeModal) {
      setHomeOpen(false);
      return;
    }

    controlledOnClose?.();
  }, [controlledOnClose, isHomeModal]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    restoreFocusRef.current = true;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : homeTriggerRef.current;

    return () => {
      if (!restoreFocusRef.current) {
        return;
      }

      const returnTarget = returnFocusRef.current;
      window.requestAnimationFrame(() => returnTarget?.focus());
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, isOpen]);

  return (
    <>
      {isHomeModal ? (
        <button
          ref={homeTriggerRef}
          type="button"
          onClick={() => setHomeOpen(true)}
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
        >
          {props.messages.home.pro.button}
        </button>
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex overflow-y-auto bg-ink-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              close();
            }
          }}
        >
          <div className="m-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-brand-700">{content.eyebrow}</p>
                <h2 id={titleId} className="mt-2 text-2xl font-bold text-ink-950">
                  {content.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => close()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-xl leading-none text-ink-600 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                aria-label={content.closeLabel}
              >
                x
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-500">{content.body}</p>
            {content.features.length > 0 ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {content.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-ink-700"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => close()}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-ink-700 hover:bg-slate-50"
              >
                {content.closeLabel}
              </button>
              <Link
                href={content.ctaHref}
                onClick={() => close(false)}
                className="inline-flex h-10 items-center justify-center rounded-md bg-ink-950 px-4 text-sm font-bold text-white hover:bg-ink-800"
              >
                {content.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundContent fullScreen />
      </body>
    </html>
  );
}

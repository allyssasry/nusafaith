import type { Metadata } from "next";
import { playfairDisplay, plusJakartaSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUSAFAITH – Edisi Kasmaran | Personalized Greeting Card",
  description:
    "Bagikan pengalamanmu di Nusafaith Edisi Kasmaran dan dapatkan greeting card digital spesial sebagai kenang-kenangan.",
  icons: {
    icon: [
      { url: "/images/nusafaith-logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/images/nusafaith-logo.png",
    apple: "/images/nusafaith-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-[#0B433B]/15 selection:text-[#0B433B]">
        {children}
      </body>
    </html>
  );
}

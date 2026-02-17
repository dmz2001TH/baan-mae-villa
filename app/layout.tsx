import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { StickyContactBar } from "@/components/StickyContactBar";
import { FacebookChatWidget } from "@/components/FacebookChatWidget";
import { generateMetadata } from "@/lib/metadata";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  subsets: ["latin"],
});

export const metadata: Metadata = generateMetadata("en");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // app/layout.tsx
<html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${playfairDisplay.variable} antialiased`}
      >
        <SessionProvider>
          <LocaleProvider>
            <SiteContentProvider>
              {children}
              <StickyContactBar />
              <FacebookChatWidget />
            </SiteContentProvider>
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

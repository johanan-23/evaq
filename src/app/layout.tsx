import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { AppProviders } from "@/components/providers/app-providers";
import { brand } from "@/config/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: brand.documentTitle,
  description: brand.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("theme")||"dark";var d=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="system"?d:t;if(r!=="light"&&r!=="dark")r="dark";var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r;}catch(e){}})();`}
        </Script>
        <NextTopLoader
          color="var(--primary)"
          height={2}
          showSpinner={false}
          shadow={false}
          crawl
          easing="ease"
          speed={200}
          zIndex={9999}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

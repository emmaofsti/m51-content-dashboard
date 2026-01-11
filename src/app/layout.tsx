import type { Metadata } from "next";
import { Urbanist, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Shell } from "../components/Shell";
import { ContributionsProvider } from "../context/ContributionsContext";

import { MouseGlow } from "../components/MouseGlow";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "M51 Content Dashboard",
  description: "Internal content tracking",
  metadataBase: new URL("https://m51.no"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "M51 Content Dashboard",
    description: "Internal content tracking",
    url: "https://m51.no",
    siteName: "M51 Content Dashboard",
    locale: "nb_NO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "l_3k6VrlpbPoPEQ8j4KGR2Wkk7B_Il_nKGjbMZfCzPs",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} ${nunito.variable}`} suppressHydrationWarning>
        <MouseGlow />
        <ContributionsProvider>
          <Shell>
            {children}
          </Shell>
        </ContributionsProvider>
      </body>
    </html>
  );
}

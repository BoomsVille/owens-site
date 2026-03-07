import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getMetadataBase } from "@/lib/siteUrl";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const metadataBase = getMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Owen Smith | Freelance Web, Social, Photography",
    template: "%s | Owen Smith"
  },
  description:
    "Freelance portfolio for web development, social media management, photography, and content creation services in the UK.",
  keywords: [
    "freelance web developer",
    "social media manager",
    "brand photography",
    "content creation",
    "portfolio"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Owen Smith | Freelance Web, Social, Photography",
    description:
      "Freelance portfolio for web development, social media management, photography, and content creation services.",
    siteName: "Owen Smith Portfolio",
    images: [
      {
        url: "/sixtowns/development/sixtowns-development-sixtownsgin.jpg",
        width: 1200,
        height: 630,
        alt: "Owen Smith portfolio showcase preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Owen Smith | Freelance Web, Social, Photography",
    description:
      "Freelance portfolio for web development, social media management, photography, and content creation services.",
    images: ["/sixtowns/development/sixtowns-development-sixtownsgin.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

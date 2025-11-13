import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css"; 

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "BAI Solutions - Web Design & IT Services by Dom Behrens",
  description: "Premium web development and design services. Specializing in Next.js, Shopify, GSAP animations, and interactive digital experiences. Portfolio by Dom Behrens.",
  keywords: ["web design", "web development", "Next.js", "Shopify", "GSAP", "portfolio", "Dom Behrens", "BAI Solutions"],
  authors: [{ name: "Dom Behrens" }],
  openGraph: {
    title: "BAI Solutions - Web Design & IT Services",
    description: "Premium web development and design services by Dom Behrens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

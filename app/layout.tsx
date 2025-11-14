import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css"; 

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
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
      <body className={`${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

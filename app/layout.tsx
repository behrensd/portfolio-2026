import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css"; 

const vhsGothic = localFont({
  src: './fonts/vhs-gothic.ttf',
  variable: '--font-vhs',
  display: 'swap',
});

// Viewport configuration - keep simple to avoid iOS Safari layout issues
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "BAI Solutions - Web Design & IT Services by Dom Behrens",
  description: "Premium web development and design services. Specializing in Next.js, Shopify, GSAP animations, and interactive digital experiences. Portfolio by Dom Behrens.",
  keywords: ["web design", "web development", "Next.js", "Shopify", "GSAP", "portfolio", "Dom Behrens", "BAI Solutions"],
  authors: [{ name: "Dom Behrens" }],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "BAI Solutions - Web Design & IT Services",
    description: "Premium web development and design services by Dom Behrens",
    type: "website",
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary',
    title: "BAI Solutions - Web Design & IT Services",
    description: "Premium web development and design services by Dom Behrens",
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${vhsGothic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

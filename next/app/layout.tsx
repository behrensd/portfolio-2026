import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "BAI Solutions - Web Design and IT Services",
  description: "Award-winning portfolio by Dom Behrens - Web design and IT Services",
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

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Self Access Centre (SAC) - FEB Universitas Brawijaya",
  description:
    "Portal Resmi E-Resource, Presensi Kunjungan Fisik, dan Monitoring Harian Self Access Centre (SAC) Fakultas Ekonomi dan Bisnis Universitas Brawijaya Malang.",
  keywords: [
    "SAC FEB UB",
    "Self Access Centre",
    "FEB Universitas Brawijaya",
    "E-Resource",
    "Presensi SAC",
    "Perpustakaan FEB UB",
  ],
  authors: [{ name: "Self Access Centre FEB UB" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0b1c30] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

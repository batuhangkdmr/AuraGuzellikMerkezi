import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Güzellik Merkezi",
  description: "Güzelliğiniz için profesyonel hizmetler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}


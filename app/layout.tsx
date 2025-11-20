import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { CompareProvider } from "./context/CompareContext";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "New Holland Yedek Parça Bayi",
  description: "New Holland yedek parça ve aksesuar satışı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <CartProvider>
          <CompareProvider>
            {children}
            <ToastContainer />
          </CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}


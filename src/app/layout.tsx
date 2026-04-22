import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Dibisnis.IN | Platform all-in-one untuk UMKM Kuliner Indonesia",
  description: "Platform manajemen, kasir (POS), dan laporan keuangan untuk UMKM Kuliner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans antialiased", inter.variable)}>
      <body>
        <NextTopLoader 
          color="#1D9E75"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1D9E75,0 0 5px #1D9E75"
        />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeRegistry } from "@/theme/ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROME | Scholastic Warehouse",
  description: "Warehouse Management System for Scholastic",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ROME",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8F7" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1110" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          {children}
          <Toaster
            position="top-center"
            expand={true}
            richColors
            toastOptions={{
              style: {
                fontSize: "1.25rem",
                padding: "1rem 1.5rem",
              },
            }}
          />
        </ThemeRegistry>
      </body>
    </html>
  );
}

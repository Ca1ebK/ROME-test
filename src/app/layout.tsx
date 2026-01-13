import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
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
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="kiosk-no-select">
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
      </body>
    </html>
  );
}

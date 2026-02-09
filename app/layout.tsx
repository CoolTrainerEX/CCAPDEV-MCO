import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Providers from "./providers.tsx";
import Nav from "./nav.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ArchersLab",
    template: "%s | ArchersLab",
  },
  description: "DLSU Lab Reservations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Nav />
              <main className="p-4">{children}</main>
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

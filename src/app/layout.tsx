import { ThemeProvider } from '@/lib/theme-provider';
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider>
          <main className="mx-auto max-w-md min-h-screen bg-background shadow-2xl relative overflow-hidden transition-colors duration-300">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

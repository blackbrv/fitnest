import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import { NavigationProgress } from "@/components/ui/NavigationProgress"
import { PageTransition } from "@/components/ui/Motion"

export const metadata: Metadata = {
  title: "FitNest — Stronger Together",
  description:
    "FitNest helps families stay active through shared workout planning, progress tracking, and accountability.",
  keywords: ["fitness", "family", "workout", "health", "tracking"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased bg-background text-foreground">
        <ThemeProvider>
          <NavigationProgress />
          <ToastProvider>
            <PageTransition>{children}</PageTransition>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import { NavigationProgress } from "@/components/ui/NavigationProgress"
import { PageTransition } from "@/components/ui/Motion"
import { SITE_URL, SITE_NAME, OG_IMAGE, OG_IMAGE_ALT } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "FitNest — Family Health & Fitness Tracker",
    template: "%s — FitNest",
  },
  description:
    "Track family workouts, monitor health progress, and build healthy habits together. FitNest is the family fitness platform that keeps everyone accountable.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Family health and fitness tracking platform — track workouts, monitor progress, and build healthy habits together.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@fitnest.app",
    contactType: "customer support",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  )
}

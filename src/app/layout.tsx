import type { Metadata, Viewport } from "next";
import { Tajawal, Noto_Sans_Arabic, Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import {
  getBaseUrl,
  SEO_KEYWORDS,
  SEO_SITE_NAME,
  SEO_DEFAULT_DESCRIPTION,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#443000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const baseUrl = getBaseUrl();

const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  "ihr2QxnRWNrKY3aZ_AiM2CpUnPJhAGfZYqAZlrDIn9Q";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "كتالوج لوتس | صندوق دعم الصناعات الريفية والبيئية",
    template: "%s | كتالوج لوتس - صندوق دعم الصناعات",
  },
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: "صندوق دعم الصناعات الريفية والبيئية", url: baseUrl }],
  creator: "صندوق دعم الصناعات الريفية والبيئية",
  publisher: "صندوق دعم الصناعات الريفية والبيئية والإنعاش الريفي",
  applicationName: "كتالوج لوتس",
  category: "تسوق وحرف تراثية",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: baseUrl,
    siteName: SEO_SITE_NAME,
    title: "كتالوج لوتس | صندوق دعم الصناعات الريفية والبيئية",
    description: SEO_DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/brand/lotus_logo.png",
        width: 800,
        height: 800,
        alt: "شعار كتالوج لوتس - صندوق دعم الصناعات الريفية والبيئية",
      },
      {
        url: "/brand/fund_seal.png",
        width: 600,
        height: 600,
        alt: "شعار صندوق دعم الصناعات الريفية والبيئية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "كتالوج لوتس | صندوق دعم الصناعات الريفية والبيئية",
    description: "الكتالوج الرقمي لمجلة لوتس ومنتجات صندوق دعم الصناعات الريفية والبيئية",
    images: ["/brand/lotus_logo.png"],
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema(baseUrl);
  const webSiteSchema = generateWebSiteSchema(baseUrl);

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${notoSansArabic.variable} ${notoSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
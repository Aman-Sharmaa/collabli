import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/seo-google-analytics";
import { CustomScripts } from "@/components/custom-scripts";
import { connectDB } from "@/lib/db";
import { CmsSetting } from "@/models/CmsSetting";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";

const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kalp.ltd - Innovation Studio",
  description:
    "Born to create innovative products. Building modern SaaS & digital products.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kalp",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const doc = await CmsSetting.findOne().select("seo").lean();
    const seo = doc?.seo as { googleSearchConsoleMetaTag?: string } | undefined;
    const verification = seo?.googleSearchConsoleMetaTag?.trim();
    if (verification) {
      return { ...defaultMetadata, other: { "google-site-verification": verification } };
    }
  } catch {
    // ignore
  }
  return defaultMetadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={urbanist.variable}>
      <body className="font-sans antialiased">
        {children}
        <GoogleAnalytics />
        <CustomScripts />
      </body>
    </html>
  );
}

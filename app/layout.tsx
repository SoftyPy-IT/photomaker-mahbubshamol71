import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const APP_NAME = "ধানের শীষের ভোট দিন | বিএনপি প্রোফাইল ফ্রেম";
const APP_DESCRIPTION =
  "আপনার প্রোফাইল ছবিতে বিএনপির ধানের শীষ প্রতীক যুক্ত করুন। সহজেই তৈরি করুন রাজনৈতিক সমর্থন প্রদর্শনের জন্য ফ্রেম। BNP Photo Frame Maker - Support Bangladesh Nationalist Party";

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: APP_NAME,
    template: "%s | বিএনপি ফটো ফ্রেম মেকার",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: "BNP Supporters Bangladesh" }],
  generator: "Next.js",
  keywords: [
    "BNP",
    "বিএনপি",
    "Bangladesh Nationalist Party",
    "বাংলাদেশ জাতীয়তাবাদী দল",
    "ধানের শীষ",
    "Dhan Shish",
    "Photo Frame",
    "ফটো ফ্রেম",
    "Profile Picture Frame",
    "প্রোফাইল পিকচার ফ্রেম",
    "Political Frame",
    "রাজনৈতিক ফ্রেম",
    "Bangladesh Politics",
    "বাংলাদেশ রাজনীতি",
    "Support BNP",
    "বিএনপি সমর্থক",
    "Facebook Frame",
    "ফেসবুক ফ্রেম",
    "Profile Photo Maker",
    "Online Frame Creator",
    "Free Photo Frame",
  ],
  referrer: "origin-when-cross-origin",
  creator: "BNP Photo Frame Team",
  publisher: "BNP Photo Frame",

  // Robots
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

  // Open Graph
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: "https://yourdomain.com",
    siteName: APP_NAME,
    title: "ধানের শীষে ভোট দিন | বিএনপি প্রোফাইল ফ্রেম তৈরি করুন",
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/icon1.png",
        width: 1200,
        height: 630,
        alt: "বিএনপি ফটো ফ্রেম মেকার - BNP Photo Frame Maker",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icon1.png"],
    creator: "@BNPFrameMaker",
  },

  manifest: "/manifest.json",

  category: "Politics",
  classification: "Photo Editor, Political Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

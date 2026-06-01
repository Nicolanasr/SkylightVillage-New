import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import RoleSimulator from "@/components/RoleSimulator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skylight Village Jaj | Mountain Campsite, Bungalows & Restaurant",
  description:
    "Escape to Skylight Village in Jaj, Mount Lebanon. Enjoy premium stargazing, octagonal wood bungalows, campgrounds for scouts and individual campers, extreme games, hiking trails, and a majestic mountain restaurant.",
  keywords: [
    "Skylight Village",
    "Jaj camping",
    "Mount Lebanon campgrounds",
    "Scout camping Lebanon",
    "Octagon bungalows Lebanon",
    "Mountain restaurant Jaj",
    "Stargazing Lebanon",
    "Hiking trails Lebanon",
  ],
};

const showSimulator = process.env.NEXT_PUBLIC_SHOW_SIMULATOR === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiasedScroll`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fafbfa] text-[#1c271c]">
        {children}
        {showSimulator && <RoleSimulator />}
      </body>
    </html>
  );
}


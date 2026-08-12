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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skylightvillagelb.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Skylight Village Jaj | Best Camping Ground, Cabins & Picnic in Jbeil, Lebanon",
    template: "%s | Skylight Village Jaj, Lebanon",
  },
  description:
    "Mount Lebanon's top stargazing campsite and day picnic ground in Jaj (Jbeil District, 1,200m altitude). Pitch your tent, stay in wooden cabins, host scout group camps, rent picnic tables, and enjoy traditional Lebanese grill near Jaj Cedar Reserve. تخييم في لبنان وأماكن بيكنيك في جبيل",
  keywords: [
    "best camping ground in Lebanon",
    "Jaj camping ground",
    "camping in Jaj",
    "attractions in Jaj",
    "Jaj cedar reserve hiking",
    "camping near Jbeil Byblos",
    "Mount Lebanon camping",
    "wood cabins Lebanon",
    "wood tents Jbeil",
    "day picnic spot Jaj",
    "day picnic grounds Jbeil",
    "scout camp Lebanon",
    "Lebanese restaurant Jaj",
    "stargazing camp Lebanon",
    "camping spots Jaj",
    "rent tables and chairs picnic Jaj",
    "family picnic spots Jbeil Mount Lebanon",
    "تخييم في لبنان",
    "محمية أرز جاج",
    "أماكن بيكنيك في جبيل",
    "شاليهات خشب جاج",
    "مخيم كشافة لبنان",
  ],
  authors: [{ name: "Skylight Village Jaj" }],
  creator: "Skylight Village Jaj",
  publisher: "Skylight Village Jaj",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Skylight Village Jaj | Best Camping Ground & Mountain Escape in Jbeil, Lebanon",
    description:
      "Stargazing campsite, wooden cabins, scout troop grounds, and day picnic setups at 1,200m altitude in Jaj, Mount Lebanon near Jbeil.",
    url: siteUrl,
    siteName: "Skylight Village Jaj",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Skylight Village Jaj Camping Ground Mount Lebanon Jbeil",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skylight Village Jaj | Best Camping Ground in Jbeil, Lebanon",
    description:
      "Campsites, wooden cabins, and outdoor day picnics in Jaj, Mount Lebanon (Jbeil District) at 1,200m altitude.",
    images: ["https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=1200&auto=format&fit=crop"],
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
};

const showSimulator = process.env.NEXT_PUBLIC_SHOW_SIMULATOR === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org JSON-LD Structured Data for LocalBusiness, Campground, Breadcrumbs & FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Campground",
        "@id": `${siteUrl}/#campground`,
        "name": "Skylight Village Jaj",
        "image": "https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=1200&auto=format&fit=crop",
        "url": siteUrl,
        "telephone": "+96176987654",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Mount Lebanon Heights, Jbeil District",
          "addressLocality": "Jaj",
          "addressRegion": "Mount Lebanon",
          "addressCountry": "LB"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 34.1500,
          "longitude": 35.7833
        },
        "areaServed": [
          "Jaj",
          "Jbeil",
          "Byblos",
          "Mount Lebanon",
          "Lebanon"
        ],
        "sameAs": [
          "https://instagram.com/skylightvillagelb",
          "https://menu.skylightvillagelb.com"
        ],
        "description": "Family-managed camping ground, wooden cabins, scout troop fields, and outdoor day picnic area located 1,200 meters above sea level in Jaj, Jbeil District, Mount Lebanon near the Jaj Cedar Reserve.",
        "amenityFeature": [
          { "@type": "LocationFeatureSpecification", "name": "Camping Ground Spots", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Wood Cabins", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Scout Group Camps", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Day Picnic Table Rentals", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Firewood & BBQ Gear Rentals", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Stargazing Sanctuary", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Near Jaj Cedar Reserve", "value": true }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/#breadcrumbs`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Campground & Lodging",
            "item": `${siteUrl}/stay`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Lebanon Outdoor Blog",
            "item": `${siteUrl}/blog`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where is Skylight Village located in Lebanon?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Skylight Village is located in Jaj, Jbeil District, Mount Lebanon, at an altitude of 1,200 meters above sea level, near the famous Jaj Cedar Reserve."
            }
          },
          {
            "@type": "Question",
            "name": "What camping and lodging options are available at Skylight Village Jaj?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We offer Land Rent for your own tent ($6/person/night), Full Setup tent package ($8/person/night), Full Comfort package with mattress ($12/person/night), Scout group troop camping ($3/person/night), Day Picnic setups ($3/person/day), and Wooden Tent Cabins ($35/night)."
            }
          },
          {
            "@type": "Question",
            "name": "Can I rent picnic tables, chairs, firewood, and BBQ gear on site?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Table and 4-chair bundles ($10), firewood boxes ($7), BBQ grill + charcoal ($10), hammocks ($5), sleeping mattresses ($5), and extra chairs ($3) are available for rent."
            }
          },
          {
            "@type": "Question",
            "name": "Is there food and shisha available at Skylight Village Jaj?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we serve fresh Lebanese Cold & Hot Mezza, charcoal grills, cold drinks, and fresh clay head shisha directly on site."
            }
          }
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiasedScroll`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fafbfa] text-[#1c271c]">
        {children}
        {showSimulator && <RoleSimulator />}
      </body>
    </html>
  );
}

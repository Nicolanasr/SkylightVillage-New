import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Trees,
  Flame,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Compass,
  Thermometer,
  ShieldCheck,
  Utensils
} from "lucide-react";
import type { Metadata } from "next";

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
  image?: {
    url: string;
    caption: string;
  };
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface ArticleData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  coverImage: string;
  keywords: string[];
  sections: ArticleSection[];
  faqs?: ArticleFaq[];
}

export const articlesData: Record<string, ArticleData> = {
  "top-day-picnic-spots-jbeil": {
    title: "Top Outdoor Day Picnic Spots Near Jbeil & Byblos, Lebanon",
    subtitle: "A Complete 2026 Guide to Family Picnic Grounds, Table & Chair Rentals, Charcoal Grills & Mountain Dining in Jaj (1,200m Altitude)",
    description:
      "Looking for a peaceful outdoor picnic spot near Jbeil and Byblos? Discover why Jaj (1,200m altitude) is the top choice for family day picnics with rented tables, chairs, running spring water, and fresh mountain air.",
    category: "Picnic & Day Visits",
    author: "Skylight Outdoor Team",
    authorRole: "Mountain Concierge & Event Coordinators",
    date: "June 10, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "day picnic spots Jbeil",
      "picnic spots near Byblos",
      "rent picnic tables Jaj",
      "family outdoor picnic Lebanon",
      "Jaj picnic area",
      "outdoor picnic grounds Mount Lebanon",
      "picnic table rental Byblos",
    ],
    sections: [
      {
        heading: "Escaping Coastal Heat: Why Jaj is Mount Lebanon's Top Day Picnic Destination",
        paragraphs: [
          "As coastal temperatures in Byblos, Jbeil, and Beirut reach summer peaks, driving 30 minutes up into the Mount Lebanon highlands brings instant cooling relief. Resting at 1,200 meters above sea level, the mountain village of Jaj provides pine-scented breezes, zero urban humidity, and panoramic green valley views.",
          "Unlike unorganized wild roadside clearings or overcrowded public parks, Skylight Village offers a dedicated, family-managed picnic sanctuary. Visitors enjoy pre-cleared shaded grounds, guaranteed table seating, clean modern restrooms, and fresh mountain spring water taps."
        ],
        callout: "Pro Tip: Being at 1,200m altitude means temperatures in Jaj are typically 6°C to 8°C cooler than coastal Byblos!",
        image: {
          url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop",
          caption: "Shaded mountain picnic area at Skylight Village Jaj (1,200m altitude)."
        }
      },
      {
        heading: "Day Picnic Rates & Equipment Rental Options",
        paragraphs: [
          "Day picnic entrance at Skylight Village is priced at an affordable $3 per person, which includes 1 complimentary chair per guest plus 1 wooden picnic table for every 4 guests. All guests receive full access to clean restroom facilities, fresh drinking water, electricity, and secured vehicle parking.",
          "To save trunk space and travel completely light, you can reserve optional gear directly on site:"
        ],
        bullets: [
          "Table & Chairs Bundle: 1 Wooden Picnic Table + 4 Folding Chairs ($10 / day)",
          "BBQ Rental + Charcoal: Heavy-duty grill setup prefilled with quality charcoal ($10 / day)",
          "Medium Firewood Box: Seasoned cedar-wood log box for afternoon campfires ($7 / box)",
          "Outdoor Hammock Rental: Strung between pine trees for afternoon naps ($5 / day)",
          "Extra Folding Chairs: Heavy-duty outdoor chairs ($3 / chair)"
        ]
      },
      {
        heading: "Lebanese Mezza, Charcoal Grills & Shisha On Site",
        paragraphs: [
          "Prefer not to pack food or cook? Our on-site kitchen serves authentic Lebanese Cold & Hot Mezza, charcoal-grilled Taouk, Kebabs, cold Almaza beer, freshly squeezed lemonade, and fresh clay-head Shisha delivered right to your picnic table.",
          "You can preview our full digital menu on your phone at https://menu.skylightvillagelb.com/ before heading up to plan your meal."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
          caption: "Fresh charcoal-grilled Lebanese Taouk and cold appetizers served on site."
        }
      },
      {
        heading: "Nearby Attractions & Combined Day Itineraries",
        paragraphs: [
          "A day picnic at Skylight Village can easily be paired with local cultural sightseeing across the Jbeil district:",
          "• Jaj Cedar Reserve (10 mins drive): Take a morning hike through ancient cedar trees before heading down for lunch.\n• St. Charbel Monastery in Annaya (15 mins drive): Stop by the famous pilgrimage sanctuary on your way up.\n• Byblos Old Souk & Citadel (30 mins drive): Finish your day with evening sunset drinks in historic Byblos."
        ]
      },
      {
        heading: "Driving Directions & Route Logistics",
        paragraphs: [
          "From Beirut, take the North Highway toward Byblos (Jbeil). Take the main Byblos exit toward Annaya / Jaj. Follow the paved mountain road past St. Charbel Monastery in Annaya directly toward Jaj. Skylight Village is clearly signposted as you reach the 1,200m altitude marker.",
          "The road is 100% asphalt-paved and accessible by standard sedans, compact cars, and buses."
        ]
      }
    ],
    faqs: [
      {
        question: "Do I need to book my day picnic table in advance?",
        answer: "While walk-ins are welcome, we recommend reserving your picnic pass online or via WhatsApp during peak summer weekends to guarantee shaded table placement."
      },
      {
        question: "Can we bring our own food and drinks for the picnic?",
        answer: "Yes! You are 100% welcome to bring your own food, beverages, and grill supplies, or order from our on-site Lebanese restaurant menu."
      },
      {
        question: "Are pets allowed at Skylight Village day picnics?",
        answer: "Yes, well-behaved leashed pets are welcome in outdoor picnic and camping areas."
      },
      {
        question: "Can we rent extra chairs, hammocks, or firewood on site?",
        answer: "Yes! Table & 4-chair bundles ($10), extra chairs ($3), firewood boxes ($7), BBQ grills ($10), and hammocks ($5) are available on demand."
      },
      {
        question: "Is there electricity and clean running water at the picnic spot?",
        answer: "Yes, fresh mountain spring water taps and electric charging outlets are accessible across the grounds."
      },
      {
        question: "What time do the picnic grounds open and close?",
        answer: "Our day picnic grounds are open daily from 9:00 AM until sunset (around 7:30 PM)."
      }
    ]
  },

  "attractions-in-jaj-mount-lebanon": {
    title: "Attractions in Jaj, Mount Lebanon: Cedar Reserve, Ancient Chapels & Outdoor Getaways",
    subtitle: "Discover What to Do, See & Experience in Jaj (Jbeil District) at 1,200m Altitude",
    description:
      "Explore the top tourist attractions in Jaj, Mount Lebanon. From ancient Phoenician cedar groves and Mar Abda stone chapel to stargazing camping grounds and family picnic spots near Byblos.",
    category: "Destination Guides",
    author: "Skylight Tourism Desk",
    authorRole: "Jbeil District Destination Expert",
    date: "June 12, 2026",
    readTime: "9 min read",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "attractions in Jaj",
      "what to do in Jaj Lebanon",
      "Jaj tourism guide",
      "Jbeil district attractions",
      "things to do near Byblos",
      "Jaj cedar reserve visiting guide",
    ],
    sections: [
      {
        heading: "Overview of Jaj: Mount Lebanon's Hidden Mountain Gem",
        paragraphs: [
          "Nestled 1,200 meters above sea level in the Jbeil (Byblos) district, Jaj is celebrated for its pristine pine forests, ancient cedar reserve, cool alpine air, and rich Phoenician history.",
          "Whether you are planning a weekend mountain getaway, a family day picnic, or an overnight stargazing camp, Jaj offers a serene alternative to crowded coastal towns."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
          caption: "Panoramic mountain valley views in Jaj, Mount Lebanon."
        }
      },
      {
        heading: "Top 5 Sights & Activities in Jaj",
        paragraphs: [
          "Here are the top sight-seeing destinations to include on your Jaj itinerary:"
        ],
        bullets: [
          "1. Jaj Cedars Reserve: Ancient cedar trees perched on dramatic karst limestone cliffs at 1,500m.",
          "2. Historic Mar Abda Chapel: Ancient stone chapel overlooking mountain peaks, perfect for quiet reflection.",
          "3. Skylight Village Stargazing Grounds: Premium campsite & wooden cabin sanctuary at 1,200m altitude.",
          "4. Outdoor Picnic Fields: Shaded pine groves with table & chair rentals, spring water, and Lebanese grill.",
          "5. Annaya Pilgrimage Route: Located just 15 minutes away, home to the Monastery of St. Charbel."
        ]
      },
      {
        heading: "Mountain Climate & Seasonal Weather Guide",
        paragraphs: [
          "Spring (April - May): Wildflowers bloom across limestone karsts. Perfect weather for morning hiking with temperatures around 18°C.",
          "Summer (June - September): Daytime highs average 24°C with dry mountain breezes. Ideal for day picnics, evening bonfires, and clear stargazing.",
          "Autumn (October - November): Crisp foliage colors and chilly evening temperatures (12°C). Great season for wood cabin stays and hot tea around the campfire."
        ],
        callout: "Pack a jacket! Even during mid-summer, night temperatures in Jaj drop to 16°C."
      },
      {
        heading: "Local Food & Bakery Stops in Jaj Village",
        paragraphs: [
          "Before heading up to the trails, stop by the village center of Jaj for freshly baked Saj manakish (Zaatar, Kishk, and Akkawi cheese) from local wood-fired bakeries.",
          "At Skylight Village, you can enjoy full Lebanese Cold & Hot Mezza and charcoal-grilled skewers prepared fresh at our on-site restaurant."
        ]
      }
    ],
    faqs: [
      {
        question: "How far is Jaj from Byblos (Jbeil)?",
        answer: "Jaj is located 28 kilometers from Byblos city center, approximately a 30 to 35-minute scenic drive up the paved mountain highway."
      },
      {
        question: "Can I visit Jaj in a small economy car?",
        answer: "Yes! The main roads from Byblos through Annaya to Jaj are completely paved asphalt and easy to navigate in standard sedans."
      },
      {
        question: "What is the altitude of Jaj village and Skylight Village?",
        answer: "Jaj village sits between 1,150m and 1,250m altitude, with Skylight Village located right at the 1,200m elevation marker."
      },
      {
        question: "Are there local bakeries in Jaj?",
        answer: "Yes, traditional wood-fired bakeries in Jaj village serve fresh morning Saj manakish."
      },
      {
        question: "Can I visit the Jaj Cedar Reserve and camp at Skylight Village in the same day?",
        answer: "Absolutely! The Jaj Cedar Reserve trail is only a 10-minute drive from Skylight Village."
      },
      {
        question: "What is the best season to visit Jaj?",
        answer: "Late spring through early autumn (May to October) offers optimal outdoor weather for hiking, picnics, and stargazing."
      }
    ]
  },

  "hiking-jaj-cedars-reserve": {
    title: "Hiking the Jaj Cedars Reserve: Trail Guide, History & Nearby Campsites",
    subtitle: "Explore the Ancient Phoenician Cedar Forest, Historic Mar Abda Chapel & Mount Lebanon Alpine Summit Trails",
    description:
      "Everything you need to know about hiking to the ancient Cedars of God in Jaj, Mount Lebanon. Trail details, historical chapel sites, and nearby camping at Skylight Village.",
    category: "Hiking & Nature Trails",
    author: "Lebanon Hiking Trail Guide",
    authorRole: "Alpine Trekking Specialist",
    date: "June 4, 2026",
    readTime: "9 min read",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "hiking Jaj cedar reserve",
      "Cedars of Jaj trail",
      "Jaj hiking trail",
      "Jbeil hiking spots",
      "attractions in Jaj",
      "ancient cedars of Lebanon",
      "Mar Abda chapel Jaj",
    ],
    sections: [
      {
        heading: "The Ancient Legacy of the Cedars of Jaj",
        paragraphs: [
          "Perched on steep limestone cliffs between 1,500 and 1,800 meters above sea level, the Cedars of Jaj represent one of the oldest and most sacred cedar groves in Lebanon. Historical records indicate that timber harvested from these high peaks was transported down to the ancient Phoenician port of Byblos for shipbuilding and temple construction.",
          "Today, the Jaj Cedar Reserve stands as a protected natural sanctuary, home to centuries-old cedar trees that have survived alpine winters and harsh mountain winds."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
          caption: "Majestic ancient cedar trees in the Jaj Cedar Reserve."
        }
      },
      {
        heading: "Trail Specs & Essential Hiker Checklist",
        paragraphs: [
          "The main trail to the cedar forest begins near Mar Abda square in Jaj. Here is what you need to know before starting your trek:"
        ],
        bullets: [
          "Trail Distance: 6 kilometers round trip",
          "Elevation Gain: ~350 meters vertical incline",
          "Trail Difficulty: Moderate (rocky karst terrain)",
          "Recommended Footwear: Sturdy hiking boots or trail runners with deep lug grips",
          "Hydration: Carry at least 1.5L of drinking water per person",
          "Weather Prep: Bring a light windbreaker layer, as ridge winds can be cool even in August"
        ]
      },
      {
        heading: "Cultural Landmarks Along the Trail",
        paragraphs: [
          "As you ascend the limestone path toward the cedar grove, you will pass historic stone altars, ancient water cisterns cut into rock face, and the famous stone chapel of Mar Abda. The quiet atmosphere and panoramic views over Mount Lebanon valleys make it a favorite spot for photography and meditation."
        ]
      },
      {
        heading: "Post-Hike Relaxation & Camping at Skylight Village",
        paragraphs: [
          "After tackling the 6km hike, head down to Skylight Village (1,200m altitude) just minutes away. Relax in a hammock under the pine trees, pitch a tent, or stay in a cozy wooden cabin with bed setup.",
          "Our grounds feature hot showers, clean restrooms, charcoal grills, cold drinks, and evening campfires where hikers gather to share trail stories."
        ]
      }
    ],
    faqs: [
      {
        question: "Is the Jaj Cedar Reserve trail suitable for kids?",
        answer: "Yes! Children aged 7 and above can comfortably complete the 6km hike with proper footwear and frequent water breaks."
      },
      {
        question: "Are there entry fees for the Jaj Cedar Reserve hike?",
        answer: "Access to the trail is generally open, though local conservation donations are encouraged to help preserve the forest."
      },
      {
        question: "What footwear and gear should I bring for the trail?",
        answer: "Sturdy hiking shoes or trail sneakers with solid traction are essential due to limestone rocks. Bring sun protection and 1.5L of water."
      },
      {
        question: "How long does the 6km round-trip hike take?",
        answer: "The trail typically takes 2.5 to 3.5 hours at a steady pace, including breaks for photos and rest."
      },
      {
        question: "Can I camp at Skylight Village after finishing the hike?",
        answer: "Yes! Skylight Village is located just 10 minutes from the trail start, offering tent spots, wooden cabins, and hot showers."
      },
      {
        question: "Are guided hiking tours available?",
        answer: "Local guides can be arranged through the Jaj municipality or Skylight Village concierge upon advance request."
      }
    ]
  },

  "glamping-vs-traditional-camping-lebanon": {
    title: "Glamping Cabins vs Ground Camping in Lebanon: Which Suits You Best?",
    subtitle: "A Head-to-Head Comparison of Wooden Octagonal Tents, Bring-Your-Own-Tent Land Rent & Camping Gear",
    description:
      "Undecided between wooden cabin glamping and traditional tent camping in Lebanon? Compare comfort, setup effort, prices, and amenities at Skylight Village Jaj.",
    category: "Lodging Guides",
    author: "Joe (Skylight Management)",
    authorRole: "Campground Operations Director",
    date: "June 8, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "glamping Lebanon",
      "wooden cabins Lebanon",
      "wood tents Jaj",
      "glamping vs camping Lebanon",
      "best glamping grounds Byblos",
    ],
    sections: [
      {
        heading: "The Evolution of Camping in Mount Lebanon",
        paragraphs: [
          "Camping in Mount Lebanon has evolved beyond sleeping on hard ground. Today, outdoor enthusiasts can choose between raw nature tent pitching and cozy wooden cabin glamping.",
          "At Skylight Village Jaj, we cater to both preferences with pre-cleared open campsite fields and octagonal wooden tent cabins."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
          caption: "Cozy wooden octagonal cabin illuminated at night in Skylight Village Jaj."
        }
      },
      {
        heading: "Comparing Your Options at Skylight Village",
        paragraphs: [
          "Here is a side-by-side comparison of lodging options available on site:"
        ],
        bullets: [
          "1. Land Rent (Bring Your Own Tent - $6/person/night): Maximum freedom, traditional camping feel, full access to spring water, electricity, and clean restrooms.",
          "2. Full Setup Tent Package ($8/person/night): Skylight team sets up the tent for you prior to arrival.",
          "3. Full Comfort Package ($12/person/night): Complete pre-setup tent equipped with foam mattresses and sleeping bedding.",
          "4. Octagonal Wooden Cabins ($35/unit/night): Solid wood A-frame structure, insulated walls, real mattress beds, raised off the ground, weatherproof."
        ]
      },
      {
        heading: "Which Accommodation Should You Pick?",
        paragraphs: [
          "• Couples & Glampers: Wooden Cabins ($35/night) offer maximum comfort, privacy, and protection against chilly mountain nights.\n• Families & Small Groups: Full Comfort Tents ($12/person) or Wooden Cabins give kids a fun outdoor experience without sacrificing sleeping quality.\n• Scouts & Experienced Campers: Land Rent ($6/person) or Scout Group Sectors ($3/person) provide open fields for gear testing and team assembly."
        ]
      }
    ],
    faqs: [
      {
        question: "Do wooden cabins have electricity and charging outlets?",
        answer: "Yes, all wooden cabins at Skylight Village have interior electric lighting and charging outlets for mobile devices."
      },
      {
        question: "Are mattresses and bedding included with wooden cabins?",
        answer: "Yes, wooden cabins ($35/night) come pre-equipped with comfortable mattress beds."
      },
      {
        question: "Can I bring my own tent for ground camping?",
        answer: "Yes! Land rent is $6 per person / night when bringing your own tent."
      },
      {
        question: "Are hot showers and clean toilets available for campers?",
        answer: "Yes, modern sanitation buildings with clean toilets and hot showers are available 24/7 for all guests."
      },
      {
        question: "What is the night temperature drop in Jaj during summer?",
        answer: "Night temperatures drop to around 16°C in summer, so bringing a hoodie or jacket is recommended."
      },
      {
        question: "How far in advance should I reserve a wooden cabin?",
        answer: "Because wooden cabins are limited, we recommend reserving 1 to 2 weeks in advance for summer weekends."
      }
    ]
  },

  "stargazing-mount-lebanon": {
    title: "The Ultimate Guide to Stargazing & Astrophotography in Mount Lebanon",
    subtitle: "Why Jaj (1,200m Altitude) Offers the Clearest Night Skies, Perseids Meteor Showers & Milky Way Views",
    description:
      "Why the unpolluted, high-altitude skies of Jaj at 1,200 meters offer the absolute best conditions to witness meteor showers and capture the Milky Way in Lebanon.",
    category: "Astronomy & Stargazing",
    author: "Astronomy Club Guest Writer",
    authorRole: "Dark-Sky Advocate & Astrophotographer",
    date: "June 1, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "stargazing Lebanon",
      "Perseids meteor shower Jaj",
      "astronomy Mount Lebanon",
      "Milky Way photo spots Lebanon",
      "dark sky camping Jbeil",
      "astrophotography locations Lebanon",
    ],
    sections: [
      {
        heading: "Zero Light Pollution Above the Coastal Haze",
        paragraphs: [
          "Light pollution from coastal cities often hides the beauty of the night sky. However, at 1,200 meters altitude in Jaj, Mount Lebanon, you rise above urban humidity and coastal haze.",
          "With clear horizons and minimal artificial lighting, Jaj is recognized as one of Mount Lebanon's top dark-sky sanctuaries for stargazing and astrophotography."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
          caption: "Clear Milky Way night sky over Skylight Village Jaj."
        }
      },
      {
        heading: "Annual Perseids Meteor Shower Gathering",
        paragraphs: [
          "Every August, the Earth passes through the trail of Comet Swift-Tuttle, producing the spectacular Perseids Meteor Shower. Skylight Village hosts annual stargazing peak nights around our central fireplace.",
          "Visitors can recline on outdoor loungers or wooden cabin porches to watch dozens of shooting stars streak across the sky every hour."
        ]
      },
      {
        heading: "Astrophotography Camera Settings & Tips for Beginners",
        paragraphs: [
          "To capture the Milky Way core over Jaj mountain peaks, use a tripod and full-frame camera with a wide lens (14mm-24mm f/2.8). Set shutter speed to 15-20 seconds, ISO 3200, and focus manually on bright stars."
        ]
      }
    ],
    faqs: [
      {
        question: "Why is Jaj better for stargazing than coastal cities?",
        answer: "At 1,200m altitude, Jaj sits far above coastal light pollution, humidity, and atmospheric smog, granting crystal-clear night skies."
      },
      {
        question: "When is the Perseids Meteor Shower peak in Lebanon?",
        answer: "The Perseids meteor shower peaks annually between August 11 and August 13."
      },
      {
        question: "Do I need a telescope to see shooting stars in Jaj?",
        answer: "No telescope is required! Shooting stars and the Milky Way arch are clearly visible to the naked eye under Jaj's dark skies."
      },
      {
        question: "Is there a central campfire for stargazing nights?",
        answer: "Yes, Skylight Village features a large central fireplace where guests gather for warm drinks, acoustic music, and stargazing."
      },
      {
        question: "Can I bring my own camera and tripod for astrophotography?",
        answer: "Yes! Photographers are encouraged to bring tripods and cameras. Open fields offer unobstructed 360-degree horizon views."
      },
      {
        question: "Are campfires allowed near individual tents at night?",
        answer: "Campfires are permitted in designated fire pits or fire boxes ($7 firewood rental) to ensure guest safety and forest protection."
      }
    ]
  },

  "lebanese-bbq-outdoor-dining-jaj": {
    title: "Traditional Lebanese BBQ & Outdoor Dining Guide in Jaj, Mount Lebanon",
    subtitle: "Mastering Charcoal Grilling, Cold Mezza & Shisha Under the Open Sky at 1,200m Altitude",
    description:
      "Discover the art of outdoor Lebanese charcoal grilling and open-air mountain dining in Jaj. Learn about prefilled BBQ grill rentals, firewood bonfires, and on-site restaurant service.",
    category: "Food & Dining",
    author: "Skylight Culinary Team",
    authorRole: "Outdoor Grill Master",
    date: "June 2, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "Lebanese restaurant Jaj",
      "outdoor barbecue Lebanon",
      "charcoal grill rental Jaj",
      "mezza and grill Byblos mountains",
      "shisha outdoor Jaj",
    ],
    sections: [
      {
        heading: "The Tradition of Outdoor Mountain Grilling",
        paragraphs: [
          "Nothing compares to the aroma of charcoal-grilled Taouk and Kebab mixed with fresh pine air at 1,200 meters altitude. In Lebanese mountain culture, outdoor barbecuing (Mashawi) is a weekly celebration.",
          "At Skylight Village Jaj, we provide everything needed for a seamless outdoor barbecue, whether you bring your own marinated meats or order directly from our kitchen."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
          caption: "Fresh charcoal-grilled skewers served under the pine trees."
        }
      },
      {
        heading: "On-Site Restaurant Menu & Shisha Service",
        paragraphs: [
          "If you prefer to relax without cooking, our kitchen serves traditional Lebanese Cold & Hot Mezza (Hummus, Tabbouleh, Moutabbal, French Fries, Fried Kebbeh), fresh charcoal grills, cold drinks, and clay-head Shisha delivered straight to your picnic table."
        ]
      }
    ],
    faqs: [
      {
        question: "Can we rent a pre-filled charcoal grill setup on site?",
        answer: "Yes! Heavy-duty barbecue grills prefilled with charcoal are available for rent at $10 / day."
      },
      {
        question: "Does Skylight Village serve fresh Lebanese Mezza and Grill?",
        answer: "Yes, our on-site kitchen serves full Lebanese Cold & Hot Mezza, charcoal Taouk, Kebabs, and fresh appetizers."
      },
      {
        question: "Is clay-head Shisha available at the dining area?",
        answer: "Yes, fresh clay-head Shisha in various flavors is prepared on site and delivered to your picnic or dining table."
      },
      {
        question: "Can we order cold drinks and beer on site?",
        answer: "Yes, ice-cold Almaza beer, soft drinks, juices, and freshly squeezed lemonade are available at the bar."
      },
      {
        question: "Where can we view the digital food menu?",
        answer: "You can view our complete digital menu online anytime at https://menu.skylightvillagelb.com/."
      },
      {
        question: "Are vegetarian options available on the mezza menu?",
        answer: "Yes! Hummus, Tabbouleh, Fattoush, Moutabbal, French Fries, and Stuffed Grape Leaves are available for vegetarian guests."
      }
    ]
  },

  "scout-campsites-guideline": {
    title: "Scout Troop & Youth Group Camping Guide in Mount Lebanon",
    subtitle: "Group Field Reservations, Campfire Safety, Electricity & Water Facilities in Jaj",
    description:
      "Essential group guidelines, campfire configurations, and spring water access for scout troop assemblies in Jaj, Mount Lebanon at Skylight Village.",
    category: "Scout & Group Camping",
    author: "Skylight Scout Liaison",
    authorRole: "Troop Assembly Director",
    date: "May 20, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "scout troop camping Lebanon",
      "scout campsites Jbeil",
      "scout group rate Jaj",
      "youth group camping Mount Lebanon",
      "troop campfire Jaj",
    ],
    sections: [
      {
        heading: "Dedicated Sectors Mapped for Troop Assemblies",
        paragraphs: [
          "Hosting scout troops requires dedicated space, clean running water, electricity outlets, and safe campfire areas. Skylight Village features two specialized scout sectors at a group rate of $3 per person / night:"
        ],
        bullets: [
          "Scout Camping Small Section: Designed for troops of 20 to 100 members",
          "Scout Camping Large Section: Designed for troops of 50 to 250 members"
        ],
        image: {
          url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop",
          caption: "Dedicated scout camping grounds in Jaj, Mount Lebanon."
        }
      }
    ],
    faqs: [
      {
        question: "What is the minimum group capacity for scout troop bookings?",
        answer: "The Small Sector requires a minimum of 20 members, while the Large Sector requires a minimum of 50 members."
      },
      {
        question: "What is the price per person for scout troop camping?",
        answer: "Scout troop land rent is offered at a special group rate of $3 per person / night (bring your own tents)."
      },
      {
        question: "Are dedicated campfire areas included for scout troops?",
        answer: "Yes, dedicated campfire and evening activity spaces are designated for each scout sector."
      },
      {
        question: "Is clean drinking water and electricity available in scout sectors?",
        answer: "Yes, running spring water taps, clean restrooms, and electric power points are accessible across scout fields."
      },
      {
        question: "Can scout leaders arrange group catering for breakfast and dinner?",
        answer: "Yes, on-site catering and group meal packages can be pre-arranged with the Skylight management team."
      },
      {
        question: "How do scout leaders reserve dates for troop camps?",
        answer: "Scout leaders can submit dates online through the Skylight stay booking form or contact our WhatsApp concierge."
      }
    ]
  },

  "best-camping-spots-in-lebanon": {
    title: "Best Camping Spots in Lebanon: From Coastal Byblos to Jaj High Altitude",
    subtitle: "Comparing Ground Camping, Glamping Cabins, Equipment Rentals & Day Picnic Outings",
    description:
      "A complete guide to the best camping grounds in Lebanon. Learn about tent setups, wooden cabins, day picnic table rentals, and stargazing in Jaj, Mount Lebanon.",
    category: "Camping Guides",
    author: "Lebanon Travel Editor",
    authorRole: "Outdoor Destinations Journalist",
    date: "May 15, 2026",
    readTime: "8 min read",
    coverImage: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop",
    keywords: [
      "best camping ground in Lebanon",
      "camping spots in Lebanon",
      "glamping cabins Lebanon",
      "camping near Byblos Jbeil",
      "family camping grounds Lebanon",
    ],
    sections: [
      {
        heading: "Why Mountain Camping in Jaj Tops the List",
        paragraphs: [
          "Lebanon offers diverse outdoor landscapes, but the high-altitude pine forests of Jaj in the Jbeil district stand out for summer coolness, mountain spring water, and stargazing visibility.",
          "At Skylight Village, campers can choose between bringing their own tents ($6/person), renting complete setup packages ($8-$12/person), or staying in cozy wooden glamping cabins ($35/night)."
        ],
        image: {
          url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop",
          caption: "Sunrise view over Mount Lebanon pine trees at Skylight Village."
        }
      }
    ],
    faqs: [
      {
        question: "What makes Skylight Village in Jaj different from other campsites in Lebanon?",
        answer: "Skylight Village offers high altitude (1,200m), zero light pollution, pre-cleared ground camping, wooden glamping cabins, gear rentals, on-site Lebanese dining, and proximity to the Jaj Cedar Reserve."
      },
      {
        question: "What accommodations are offered at Skylight Village?",
        answer: "We offer Land Rent ($6/person), Full Setup Tents ($8/person), Full Comfort Tents ($12/person), Scout Sectors ($3/person), Day Picnic Pass ($3/person), and Wooden Cabins ($35/night)."
      },
      {
        question: "Can I book for 1 night or single-day visits?",
        answer: "Yes! Single-day visits and 1-night overnight stays can be reserved online."
      },
      {
        question: "Are there modern sanitation and shower facilities on site?",
        answer: "Yes, modern sanitation buildings with clean flush toilets and hot showers are available for all guests."
      },
      {
        question: "What equipment can I rent on site?",
        answer: "Table & chair bundles ($10), extra chairs ($3), firewood boxes ($7), BBQ grills ($10), and hammocks ($5) are available on site."
      },
      {
        question: "How do I check live date availability and reserve online?",
        answer: "Select your arrival date on the Skylight /stay page or click 'Book Now' on any accommodation option."
      }
    ]
  }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesData[slug];

  if (!article) {
    return { title: "Article Not Found | Skylight Village Jaj" };
  }

  return {
    title: `${article.title} | Skylight Village Jaj`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      images: [{ url: article.coverImage }],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = articlesData[slug];

  if (!article) {
    return notFound();
  }

  // Schema.org Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "image": article.coverImage,
    "author": {
      "@type": "Person",
      "name": article.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Skylight Village Jaj",
      "logo": {
        "@type": "ImageObject",
        "url": "https://skylightvillagelb.com/images/Skylight-logo-white.png",
      },
    },
    "datePublished": article.date,
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      {/* Hero Header Section with Main Cover Image Background & Dark Overlay */}
      <section className="relative pt-28 pb-24 px-4 md:px-8 text-white overflow-hidden bg-slate-950">
        {/* Main Cover Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 z-0"
          style={{ backgroundImage: `url('${article.coverImage}')` }}
        />
        {/* Dark Emerald/Black Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071308]/90 via-[#071308]/80 to-[#071308] z-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.2)_0%,transparent_70%)] z-0" />

        <div className="container mx-auto max-w-4xl relative z-10 space-y-6">
          {/* Top Row: Back Button */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg"
            >
              <ChevronLeft size={16} />
              <span>Back to Articles</span>
            </Link>
          </div>

          {/* Category Tag */}
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-sm">
              {article.category}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-md">
            {article.title}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed max-w-3xl drop-shadow-sm">
            {article.subtitle}
          </p>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/15 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400/40">
                <User size={15} />
              </div>
              <div>
                <span className="block font-bold text-white text-xs">{article.author}</span>
                <span className="block text-[10px] text-slate-300">{article.authorRole}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-200">
              <Calendar size={14} className="text-amber-400" />
              <span>{article.date}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-200">
              <Clock size={14} className="text-amber-400" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Unified Content Container */}
      <section className="py-12 px-4 md:px-8 -mt-8 relative z-20">
        <div className="container mx-auto max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 md:p-12 space-y-10">
          {article.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-[#071308] border-b border-slate-100 pb-2">
                {section.heading}
              </h2>

              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-base text-slate-700 font-light leading-relaxed">
                  {p}
                </p>
              ))}

              {/* Bullets List */}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2.5 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 my-4">
                  {section.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-sm font-semibold text-slate-800">
                      <CheckCircle2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Highlight Callout Box */}
              {section.callout && (
                <div className="p-5 rounded-2xl bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-xs font-bold leading-relaxed flex items-start gap-3 shadow-xs my-4">
                  <Sparkles size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{section.callout}</span>
                </div>
              )}

              {/* Inline Image */}
              {section.image && (
                <div className="pt-4 space-y-2">
                  <div className="rounded-2xl overflow-hidden shadow-md aspect-[16/10] border border-slate-200">
                    <img
                      src={section.image.url}
                      alt={section.image.caption}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium text-center italic">
                    {section.image.caption}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* FAQs Accordion Block */}
          {article.faqs && article.faqs.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <h3 className="text-xl font-display font-extrabold text-[#071308] flex items-center gap-2">
                <HelpCircle size={20} className="text-amber-600" />
                <span>Frequently Asked Questions ({article.faqs.length})</span>
              </h3>
              <div className="space-y-3">
                {article.faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="text-sm font-bold text-[#071308]">{faq.question}</h4>
                    <p className="text-xs text-slate-600 font-light leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Call To Action Box */}
          <div className="border-t border-slate-200 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#071308] to-emerald-950 p-8 rounded-3xl text-white shadow-xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Experience Jaj, Mount Lebanon</span>
              <h4 className="text-xl font-display font-bold text-white mt-1">Ready for an Outdoor Mountain Getaway?</h4>
              <p className="text-xs text-slate-300 font-light mt-1 max-w-md">Book your camping ground spot, wooden A-frame cabin, or day picnic table online in seconds.</p>
            </div>
            <Link
              href="/stay"
              className="px-6 py-4 bg-amber-400 hover:bg-amber-300 text-[#071308] font-display font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex-shrink-0 inline-flex items-center gap-2"
            >
              <span>Book Camping &amp; Picnic</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

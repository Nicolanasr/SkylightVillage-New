import { db as prisma } from "../src/lib/db";

async function main() {
  console.log("Cleaning database...");
  await prisma.localAttraction.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.assetAllocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.restaurantBooking.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.restaurantZone.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.eventReservation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.bookingAddonSelection.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.accommodationAddon.deleteMany();
  await prisma.accommodation.deleteMany();

  console.log("Seeding Skylight Village lodging, packages, and rental addons...");

  const campingImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop",
  ];

  const woodTentImages = [
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop",
  ];

  const picnicImages = [
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop",
  ];

  // Common Gear Addons
  const gearAddons = [
    { name: "Table & Chairs Bundle (1 Table + 4 Chairs)", price: 10.0, priceType: "ONCE" },
    { name: "Firewood (Medium Box)", price: 7.0, priceType: "ONCE" },
    { name: "BBQ Rental + Charcoal", price: 10.0, priceType: "ONCE" },
    { name: "Sleeping Mattress Rental", price: 5.0, priceType: "ONCE" },
    { name: "Hammock Rental", price: 5.0, priceType: "ONCE" },
    { name: "Extra Chair Rental", price: 3.0, priceType: "ONCE" },
  ];

  // 1. SCOUT CAMPING
  await prisma.accommodation.create({
    data: {
      name: "Scout Camping (Large Section)",
      slug: "scout-camping-large-section",
      type: "SCOUT_ZONE",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 3.0,
      minCapacity: 50,
      maxCapacity: 250,
      description:
        "Dedicated large troop section (Min 50 members). $3 per person / night. Bring Your Own Tents. Includes electricity, clean running water, restrooms, and dedicated campfire spaces.",
      addons: {
        create: [
          { name: "Firewood (Medium Box)", price: 7.0, priceType: "ONCE" },
          { name: "BBQ Rental + Charcoal", price: 10.0, priceType: "ONCE" },
          { name: "Table & Chairs Bundle (1 Table + 4 Chairs)", price: 10.0, priceType: "ONCE" },
        ],
      },
      images: {
        create: [
          { imageUrl: campingImages[0], order: 1 },
          { imageUrl: campingImages[1], order: 2 },
        ],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: "Scout Camping (Small Section)",
      slug: "scout-camping-small-section",
      type: "SCOUT_ZONE",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 3.0,
      minCapacity: 20,
      maxCapacity: 100,
      description:
        "Dedicated small troop section (Min 20 members). $3 per person / night. Bring Your Own Tents. Includes electricity, clean running water, restrooms, and dedicated campfire spaces.",
      addons: {
        create: [
          { name: "Firewood (Medium Box)", price: 7.0, priceType: "ONCE" },
          { name: "BBQ Rental + Charcoal", price: 10.0, priceType: "ONCE" },
          { name: "Table & Chairs Bundle (1 Table + 4 Chairs)", price: 10.0, priceType: "ONCE" },
        ],
      },
      images: {
        create: [{ imageUrl: campingImages[1], order: 1 }],
      },
    },
  });

  // 2. FAMILY & GROUP CAMPING SEPARATE PACKAGES
  await prisma.accommodation.create({
    data: {
      name: "Land Rent (Bring Your Own Tent)",
      slug: "land-rent-bring-your-own-tent",
      type: "INDIVIDUAL_CAMP",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 6.0,
      minCapacity: 1,
      maxCapacity: 20,
      description:
        "Pitch your own tent under the stars at 1,200m altitude ($6/person/night). Includes access to clean restrooms, parking, and electricity. Extra gear & tents available for rental below!",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: campingImages[2], order: 1 }],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: "Full Setup Package",
      slug: "full-setup-package",
      type: "INDIVIDUAL_CAMP",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 8.0,
      minCapacity: 1,
      maxCapacity: 20,
      description:
        "Includes tent rental + 1 complimentary chair per person ($8/person/night). Access to clean restrooms, parking, and electricity. Gear rentals available below!",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: campingImages[0], order: 1 }],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: "Full Comfort Package",
      slug: "full-comfort-package",
      type: "INDIVIDUAL_CAMP",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 12.0,
      minCapacity: 1,
      maxCapacity: 20,
      description:
        "Includes tent rental + sleeping mattress + 1 complimentary chair per person ($12/person/night). Access to clean restrooms, parking, and electricity. Gear rentals available below!",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: campingImages[1], order: 1 }],
      },
    },
  });

  // 3. WOODEN TENT CABINS
  await prisma.accommodation.create({
    data: {
      name: "Single Wood Tent Stay",
      slug: "single-wood-tent-stay",
      type: "WOOD_TENT",
      pricingType: "PER_UNIT_PER_NIGHT",
      basePrice: 35.0,
      minCapacity: 1,
      maxCapacity: 3,
      description:
        "Fits 2–3 people ($35/night). Includes full bed setup + 2 complimentary chairs + private outdoor space in front of cabin. Gear rentals available below!",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: woodTentImages[0], order: 1 }],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: "Wood Tent 'Night Out' Bundle",
      slug: "wood-tent-night-out-bundle",
      type: "WOOD_TENT",
      pricingType: "PER_UNIT_PER_NIGHT",
      basePrice: 50.0,
      minCapacity: 1,
      maxCapacity: 3,
      description:
        "Includes 1 Wood Tent + 1 Table & 4 Chairs + Firewood Box + BBQ Grill & Charcoal setup ($50/night). Additional gear available for rental below!",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: woodTentImages[1], order: 1 }],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: "Exclusive Group Takeover (All 3 Wood Tents)",
      slug: "exclusive-group-takeover-wood-tents",
      type: "WOOD_TENT",
      pricingType: "PER_UNIT_PER_NIGHT",
      basePrice: 135.0,
      minCapacity: 1,
      maxCapacity: 9,
      description:
        "All 3 Wood Tents [fits 6–9 people] ($135 total/night) + 100% private outdoor courtyard & bonfire area + 2 Large Tables & 8 Chairs + 1 Firewood Box + 1 BBQ Grill & Charcoal setup.",
      addons: {
        create: gearAddons,
      },
      images: {
        create: [{ imageUrl: woodTentImages[0], order: 1 }],
      },
    },
  });

  // 4. DAY PICNIC AREA
  await prisma.accommodation.create({
    data: {
      name: "Day Picnic Setup",
      slug: "day-picnic-setup",
      type: "PICNIC_DAY",
      pricingType: "PER_PERSON_PER_DAY",
      basePrice: 3.0,
      minCapacity: 1,
      maxCapacity: 50,
      description:
        "Day outdoor picnic in nature ($3/person). Includes 1 complimentary chair per person + 1 picnic table for every 4 guests. Access to clean restrooms, running water, parking, and electricity. BBQ, firewood, and hammocks available for rent!",
      addons: {
        create: [
          { name: "BBQ Rental + Charcoal", price: 10.0, priceType: "ONCE" },
          { name: "Firewood (Medium Box)", price: 7.0, priceType: "ONCE" },
          { name: "Hammock Rental", price: 5.0, priceType: "ONCE" },
          { name: "Table & Chairs Bundle (1 Table + 4 Chairs)", price: 10.0, priceType: "ONCE" },
          { name: "Extra Chair Rental", price: 3.0, priceType: "ONCE" },
        ],
      },
      images: {
        create: [{ imageUrl: picnicImages[0], order: 1 }],
      },
    },
  });

  // Events & Attractions
  await prisma.event.create({
    data: {
      title: "Perseids Stargazing Peak Night",
      slug: "perseids-stargazing-peak-night",
      description:
        "Gather around our central fireplace at 1,200m altitude in Jaj for an unforgettable view of the Perseids meteor shower.",
      date: new Date("2026-08-12T20:00:00Z"),
      price: 15.0,
      requiresTicket: true,
      capacity: 100,
    },
  });

  await prisma.event.create({
    data: {
      title: "Scout Bonfire & Wilderness Reunion",
      slug: "scout-bonfire-wilderness-reunion",
      description:
        "Grand community gathering for hikers, mountaineers, and scout troops to trade stories, practice campcraft, and enjoy acoustic tunes around the central fire.",
      date: new Date("2026-06-25T18:00:00Z"),
      price: 0.0,
      requiresTicket: false,
      capacity: 200,
    },
  });

  await prisma.localAttraction.create({
    data: {
      name: "Jaj Cedar Reserve",
      category: "Nature Reserve",
      description: "Home to ancient Cedars of God perched high on Mount Lebanon cliffside.",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
      location: "Jaj Heights",
      distance: "10 mins hike",
      details: "One of the highest and oldest cedar stands in Lebanon.",
      externalUrl: "https://en.wikipedia.org/wiki/Cedars_of_God",
    },
  });

  console.log("Database successfully seeded with distinct package cards & gear rental add-ons!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

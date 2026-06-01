import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

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

  console.log("Seeding accommodations...");
  const scoutZone1 = await prisma.accommodation.create({
    data: {
      name: "Scout Camping Area (Zone 1)",
      slug: "scout-camping-area-zone-1",
      type: "SCOUT_ZONE",
      pricingType: "PER_PERSON_PER_DAY",
      basePrice: 5.0,
      minCapacity: 50,
      maxCapacity: 250,
      images: {
        create: [
          { imageUrl: "https://picsum.photos/seed/scoutzone1-1/800/600", order: 1 },
          { imageUrl: "https://picsum.photos/seed/scoutzone1-2/800/600", order: 2 },
          { imageUrl: "https://picsum.photos/seed/scoutzone1-3/800/600", order: 3 }
        ]
      }
    },
  });

  const scoutZone2 = await prisma.accommodation.create({
    data: {
      name: "Scout Camping Area (Zone 2)",
      slug: "scout-camping-area-zone-2",
      type: "SCOUT_ZONE",
      pricingType: "PER_PERSON_PER_DAY",
      basePrice: 5.0,
      minCapacity: 20,
      maxCapacity: 200,
      images: {
        create: [
          { imageUrl: "https://picsum.photos/seed/scoutzone2-1/800/600", order: 1 },
          { imageUrl: "https://picsum.photos/seed/scoutzone2-2/800/600", order: 2 }
        ]
      }
    },
  });

  const normalCamp = await prisma.accommodation.create({
    data: {
      name: "Individual Campground Spot",
      slug: "individual-campground-spot",
      type: "INDIVIDUAL_CAMP",
      pricingType: "PER_PERSON_PER_NIGHT",
      basePrice: 10.0,
      minCapacity: 1,
      maxCapacity: 15,
      addons: {
        create: [
          { name: "Premium 4-Person Tent Rental", price: 15.0, priceType: "PER_NIGHT" },
          { name: "Scout Sleeping Bag & Mat", price: 5.0, priceType: "ONCE" },
          { name: "Campfire Firewood Bundle", price: 8.0, priceType: "ONCE" },
        ],
      },
      images: {
        create: [
          { imageUrl: "https://picsum.photos/seed/normalcamp-1/800/600", order: 1 },
          { imageUrl: "https://picsum.photos/seed/normalcamp-2/800/600", order: 2 },
          { imageUrl: "https://picsum.photos/seed/normalcamp-3/800/600", order: 3 }
        ]
      }
    },
  });

  // Fetch the created camp addons for later use
  const campAddons = await prisma.accommodationAddon.findMany({
    where: { accommodationId: normalCamp.id },
  });

  // Seeding 4 wood tents
  for (let i = 1; i <= 4; i++) {
    await prisma.accommodation.create({
      data: {
        name: `Wood Tent #${i}`,
        slug: `wood-tent-${i}`,
        type: "WOOD_TENT",
        pricingType: "PER_UNIT_PER_NIGHT",
        basePrice: 45.0,
        minCapacity: 1,
        maxCapacity: 4,
        images: {
          create: [
            { imageUrl: `https://picsum.photos/seed/woodtent-${i}-1/800/600`, order: 1 },
            { imageUrl: `https://picsum.photos/seed/woodtent-${i}-2/800/600`, order: 2 }
          ]
        }
      },
    });
  }

  // Seeding upcoming octagonal bungalows
  await prisma.accommodation.create({
    data: {
      name: "Mountain View Octagonal Bungalow (Coming Soon)",
      slug: "mountain-view-octagonal-bungalow",
      type: "BUNGALOW",
      pricingType: "PER_UNIT_PER_NIGHT",
      basePrice: 120.0,
      minCapacity: 1,
      maxCapacity: 6,
      images: {
        create: [
          { imageUrl: "https://picsum.photos/seed/bungalow-1/800/600", order: 1 },
          { imageUrl: "https://picsum.photos/seed/bungalow-2/800/600", order: 2 },
          { imageUrl: "https://picsum.photos/seed/bungalow-3/800/600", order: 3 }
        ]
      }
    },
  });

  console.log("Seeding staff...");
  const waiterJoe = await prisma.staff.create({
    data: { name: "Joe", role: "WAITER" },
  });
  const waiterRita = await prisma.staff.create({
    data: { name: "Rita", role: "WAITER" },
  });
  await prisma.staff.create({
    data: { name: "Chef Charbel", role: "KITCHEN" },
  });
  await prisma.staff.create({
    data: { name: "Fadi (Shisha Prep)", role: "SHISHA" },
  });

  console.log("Seeding restaurant zones and tables...");
  const zoneRestaurant = await prisma.restaurantZone.create({
    data: {
      name: "Skylight Restaurant",
      slug: "skylight-restaurant",
      description: "Warm cozy cabin seating and panoramic valley terrace. Open Saturdays & Sundays starting 12:00 PM.",
      capacity: 80,
      price: 0,
      minCapacity: 1,
      daysOpen: "SATURDAY,SUNDAY",
      openHour: 12,
      coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      images: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop", order: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop", order: 2 },
          { imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800&auto=format&fit=crop", order: 3 },
          { imageUrl: "https://images.unsplash.com/photo-1545224497-5d22f664b4c4?q=80&w=800&auto=format&fit=crop", order: 4 }
        ]
      }
    },
  });

  const zoneSunsetBar = await prisma.restaurantZone.create({
    data: {
      name: "Sunset Bar",
      slug: "sunset-bar",
      description: "Cozy sunset vibes and cocktails overlooking the mountains. Open Saturdays starting 5:00 PM.",
      capacity: 40,
      price: 0,
      minCapacity: 1,
      daysOpen: "SATURDAY",
      openHour: 17,
      coverImage: "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=1200&auto=format&fit=crop",
      images: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800&auto=format&fit=crop", order: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop", order: 2 },
          { imageUrl: "https://images.unsplash.com/photo-1521503862198-2ae9a997bbc9?q=80&w=800&auto=format&fit=crop", order: 3 },
          { imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop", order: 4 }
        ]
      }
    },
  });

  const zoneDIY = await prisma.restaurantZone.create({
    data: {
      name: "Outdoor Picnic Spot",
      slug: "outdoor-picnic-spot",
      description: "Scenic open-air spots where you bring your own food & supplies. Solid wood table & chairs provided ($5/chair/day, minimum 4 persons). Supplies store available inside Skylight Village. Open daily, any time.",
      capacity: 100,
      price: 1.0,
      minCapacity: 4,
      daysOpen: "SATURDAY,SUNDAY",
      openHour: 10,
      coverImage: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1200&auto=format&fit=crop",
      images: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop", order: 1 },
          { imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop", order: 2 },
          { imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop", order: 3 },
          { imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop", order: 4 }
        ]
      }
    },
  });

  // Assign tables to zones
  const table1 = await prisma.restaurantTable.create({
    data: { number: 1, zoneId: zoneRestaurant.id, capacity: 4, assignedStaffId: waiterJoe.id },
  });
  const table2 = await prisma.restaurantTable.create({
    data: { number: 2, zoneId: zoneRestaurant.id, capacity: 4, assignedStaffId: waiterJoe.id },
  });
  await prisma.restaurantTable.create({
    data: { number: 3, zoneId: zoneRestaurant.id, capacity: 6, assignedStaffId: waiterRita.id },
  });
  await prisma.restaurantTable.create({
    data: { number: 4, zoneId: zoneRestaurant.id, capacity: 6, assignedStaffId: waiterRita.id },
  });
  await prisma.restaurantTable.create({
    data: { number: 5, zoneId: zoneRestaurant.id, capacity: 8 },
  });
  // Sunset Bar tables
  await prisma.restaurantTable.create({
    data: { number: 20, zoneId: zoneSunsetBar.id, capacity: 4 },
  });
  await prisma.restaurantTable.create({
    data: { number: 21, zoneId: zoneSunsetBar.id, capacity: 4 },
  });
  await prisma.restaurantTable.create({
    data: { number: 22, zoneId: zoneSunsetBar.id, capacity: 6 },
  });
  // DIY Picnic tables
  await prisma.restaurantTable.create({
    data: { number: 10, zoneId: zoneDIY.id, capacity: 4 },
  });
  await prisma.restaurantTable.create({
    data: { number: 11, zoneId: zoneDIY.id, capacity: 6 },
  });
  await prisma.restaurantTable.create({
    data: { number: 12, zoneId: zoneDIY.id, capacity: 8 },
  });

  console.log("Seeding stock items...");
  const stockAlmaza = await prisma.stockItem.create({
    data: { name: "Almaza Pilsner Beer", category: "BEVERAGE", quantity: 120, unit: "units", minThreshold: 15 },
  });
  const stockCola = await prisma.stockItem.create({
    data: { name: "Coca Cola Cans", category: "BEVERAGE", quantity: 180, unit: "units", minThreshold: 15 },
  });
  const stockArak = await prisma.stockItem.create({
    data: { name: "Arak Touma Bottle", category: "ALCOHOL", quantity: 20, unit: "units", minThreshold: 5 },
  });
  const stockCoal = await prisma.stockItem.create({
    data: { name: "Coconut Shisha Coal", category: "SHISHA_ITEM", quantity: 300, unit: "units", minThreshold: 50 },
  });
  const stockTobacco = await prisma.stockItem.create({
    data: { name: "Double Apple Tobacco", category: "SHISHA_ITEM", quantity: 45, unit: "units", minThreshold: 10 },
  });
  const stockKabab = await prisma.stockItem.create({
    data: { name: "Spiced Kabab Meat", category: "FOOD", quantity: 180, unit: "units", minThreshold: 20 },
  });
  const stockHummus = await prisma.stockItem.create({
    data: { name: "Traditional Hummus Paste", category: "FOOD", quantity: 14, unit: "units", minThreshold: 15 }, // low stock warning test
  });

  console.log("Seeding menu categories and items...");
  const catGrill = await prisma.menuCategory.create({
    data: { name: "Grill" },
  });
  const catAppetizers = await prisma.menuCategory.create({
    data: { name: "Cold Appetizers" },
  });
  const catDrinks = await prisma.menuCategory.create({
    data: { name: "Drinks & Spirits" },
  });
  const catShisha = await prisma.menuCategory.create({
    data: { name: "Premium Shisha" },
  });

  // Add items mapped to stock
  await prisma.menuItem.create({
    data: {
      name: "Spiced Kabab Skewer Platter",
      description: "Lebanese kabab grilled over hot embers, served with char-grilled onions, tomatoes, and biwaz bread.",
      price: 18.0,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947",
      categoryId: catGrill.id,
      stockItemId: stockKabab.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Mixed Charcoal Grill Platter",
      description: "A combination of Kabab skewers, Tawouk, and Beef cubes, served with garlic paste and pickles.",
      price: 26.0,
      imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143",
      categoryId: catGrill.id,
      stockItemId: stockKabab.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Traditional Creamy Hummus",
      description: "Smooth chickpea puree blended with tahini, fresh lemon juice, garlic, topped with olive oil and pine nuts.",
      price: 6.0,
      imageUrl: "https://images.unsplash.com/photo-1577906096429-f73bc2c3c263",
      categoryId: catAppetizers.id,
      stockItemId: stockHummus.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Fresh Valley Fattoush Salad",
      description: "Crisp romaine, vine-ripened tomatoes, cucumbers, purslane, toasted flatbread, tossed in sumac-pomegranate dressing.",
      price: 7.0,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999",
      categoryId: catAppetizers.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Almaza Pilsner Bottle",
      description: "The classic, crisp Lebanese golden lager - served ice cold.",
      price: 4.0,
      imageUrl: "https://images.unsplash.com/photo-1608270176050-12ec057de108",
      categoryId: catDrinks.id,
      stockItemId: stockAlmaza.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Glass of Traditional Arak",
      description: "Premium triple-distilled Touma Arak served with ice cubes and spring water.",
      price: 5.5,
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
      categoryId: catDrinks.id,
      stockItemId: stockArak.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Cold Soda Can",
      description: "Coca Cola, Sprite, or Fanta served over ice.",
      price: 2.0,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
      categoryId: catDrinks.id,
      stockItemId: stockCola.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Double Apple Traditional Shisha",
      description: "Classic Nakhla molasses double apple shisha, prepared with clay head and natural coconut coals.",
      price: 12.0,
      imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1",
      categoryId: catShisha.id,
      stockItemId: stockTobacco.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Grape & Mint Modern Shisha",
      description: "Smooth, sweet grape molasses infused with fresh mint cooling flavors.",
      price: 13.5,
      imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1",
      categoryId: catShisha.id,
      stockItemId: stockCoal.id,
    },
  });

  console.log("Seeding physical assets...");
  const assetChairs = await prisma.asset.create({
    data: { name: "Heavy Wooden Picnic Chairs", totalQty: 200 },
  });
  const assetTents = await prisma.asset.create({
    data: { name: "Waterproof 4-Person Dome Tents", totalQty: 30 },
  });
  const assetTables = await prisma.asset.create({
    data: { name: "Picnic Bench Wooden Tables", totalQty: 40 },
  });

  // Assign asset allocations
  await prisma.assetAllocation.createMany({
    data: [
      { assetId: assetChairs.id, location: "RESTAURANT", quantity: 100, status: "ACTIVE" },
      { assetId: assetChairs.id, location: "CAMPGROUND", quantity: 60, status: "ACTIVE" },
      { assetId: assetChairs.id, location: "RESERVE", quantity: 30, status: "ACTIVE" },
      { assetId: assetChairs.id, location: "REPAIR", quantity: 10, status: "REPAIRING" },

      { assetId: assetTents.id, location: "CAMPGROUND", quantity: 18, status: "ACTIVE" },
      { assetId: assetTents.id, location: "RESERVE", quantity: 9, status: "ACTIVE" },
      { assetId: assetTents.id, location: "REPAIR", quantity: 3, status: "REPAIRING" },

      { assetId: assetTables.id, location: "RESTAURANT", quantity: 20, status: "ACTIVE" },
      { assetId: assetTables.id, location: "CAMPGROUND", quantity: 15, status: "ACTIVE" },
      { assetId: assetTables.id, location: "RESERVE", quantity: 5, status: "ACTIVE" },
    ],
  });

  console.log("Seeding sample events...");
  await prisma.event.create({
    data: {
      title: "Perseids Stargazing Peak Night",
      slug: "perseids-stargazing-peak-night",
      description: "Gather around our large mountain fireplace at 1,200m altitude in Jaj for an unforgettable view of the Perseids meteor shower. Includes astronomers with professional telescopes, hot herbal tea, campfire stories, and acoustics music.",
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
      description: "A grand community gathering for hikers, mountaineers, and scout troops to trade stories, practice campcraft, and enjoy standard mountain acoustic tunes around the massive Skylight central fire. Free entry, booking required.",
      date: new Date("2026-06-25T17:00:00Z"),
      price: 0.0,
      requiresTicket: false,
      capacity: 250,
    },
  });

  console.log("Seeding initial demo reservations...");
  const demoBooking = await prisma.booking.create({
    data: {
      accommodationId: normalCamp.id,
      customerName: "Elie Haddad",
      customerEmail: "elie@haddad.com",
      customerPhone: "+961 70 123456",
      startDate: new Date("2026-06-15T14:00:00Z"),
      endDate: new Date("2026-06-17T11:00:00Z"),
      peopleCount: 3,
      totalPrice: 106.0, // (3 people * 10$ * 2 nights) + (1 tent * 15$ * 2 nights) + (2 sleeping bags * 5$ once) + (1 firewood * 8$ once) = 60 + 30 + 10 + 8 = 108$
      status: "DEPOSIT_PAID",
    },
  });

  // Select addons for demo booking
  await prisma.bookingAddonSelection.createMany({
    data: [
      { bookingId: demoBooking.id, addonId: campAddons[0].id, quantity: 1 }, // Tent rental
      { bookingId: demoBooking.id, addonId: campAddons[1].id, quantity: 2 }, // Sleeping bags
      { bookingId: demoBooking.id, addonId: campAddons[2].id, quantity: 1 }, // Firewood
    ],
  });

  console.log("Seeding local attractions...");
  await prisma.localAttraction.createMany({
    data: [
      {
        name: "Jaj Cedars Reserve",
        category: "Nature Reserve",
        description: "One of the oldest cedar forests in Lebanon, perched on majestic rocky peaks at 1,500m.",
        imageUrl: "https://picsum.photos/seed/jajcedars/600/400",
        location: "Jaj Heights",
        distance: "10 mins hike",
        details: "The Jaj Cedars represent a direct link to ancient history, with trees dating back hundreds of years nested amongst dramatic, craggy limestone mountains. It offers peaceful hiking trails with panoramic views, perfectly suited for morning nature walks and sunset meditations.",
        externalUrl: "https://www.lebanontraveler.com/en/details/jaj-cedars-reserve/"
      },
      {
        name: "Balou’ Balaa Pothole",
        category: "Waterfalls & Cave",
        description: "A breathtaking waterfall dropping 250 meters through a natural limestone cave and three outstanding stone bridges.",
        imageUrl: "https://picsum.photos/seed/baloubalaa/600/400",
        location: "Tannourine",
        distance: "25 mins drive",
        details: "Discovered in 1952, this spectacular geological formation features a 250m waterfall plunging down into a deep sinkhole. The trail leads visitors over three naturally formed limestone bridges stacked on top of each other, creating one of the most stunning photographic spots in all of Lebanon.",
        externalUrl: "https://www.lebanontraveler.com/en/details/balou-balaa-pothole/"
      },
      {
        name: "Byblos Phoenician Port",
        category: "UNESCO Heritage",
        description: "One of the oldest continuously inhabited Phoenician port cities in the world. Explore Byblos Castle and ancient souks.",
        imageUrl: "https://picsum.photos/seed/byblosancient/600/400",
        location: "Byblos Coast",
        distance: "35 mins drive",
        details: "Byblos (Jbeil) is a UNESCO World Heritage site and a breathtaking historical treasure. Take a scenic mountain drive down to visit the Crusaders' Castle, ancient Phoenician temple ruins, the active fishing harbor, and walk through the atmospheric stone souks famous for premium seafood and arak.",
        externalUrl: "https://whc.unesco.org/en/list/295"
      },
      {
        name: "Afqa Grotto",
        category: "Limestone Grotto",
        description: "The source waterfall of the Adonis River, where a massive limestone cave entrance stands adjacent to ancient ruins.",
        imageUrl: "https://picsum.photos/seed/afqacave/600/400",
        location: "Afqa Valley",
        distance: "30 mins drive",
        details: "The legendary birthplace of Adonis and Venus, Afqa features a massive natural grotto opening in a sheer limestone cliff from which the Adonis River springs. The site includes ruins of a Roman temple and beautiful picnic sites near fresh cascading mountain waters.",
        externalUrl: "https://www.lebanontraveler.com/en/details/afqa-grotto-waterfall/"
      },
      {
        name: "Saint Charbel Sanctuary",
        category: "Pilgrimage Site",
        description: "The holy monastery of Annaya, a legendary place of spiritual peace nestled on a scenic peak overlooking the Jbeil coast.",
        imageUrl: "https://picsum.photos/seed/annayasanctuary/600/400",
        location: "Annaya Peaks",
        distance: "20 mins drive",
        details: "The final resting place of Saint Charbel, this high altitude monastery and hermitage welcomes millions of pilgrims from around the world. It provides breathtaking spiritual tranquility and views across Jbeil's rolling green valleys down to the blue Mediterranean.",
        externalUrl: "https://www.marcharbel.com/"
      },
      {
        name: "Laklouk Ski & Alpine Lakes",
        category: "Alpine Resort",
        description: "High-altitude alpine lakes, hiking paths, stargazing meadows, and pristine ski slopes in winter.",
        imageUrl: "https://picsum.photos/seed/lakloukresort/600/400",
        location: "Laklouk Heights",
        distance: "15 mins drive",
        details: "Perched at 1,800m altitude, Laklouk is a perfect mountain playground in all seasons. Known for pristine ski slopes in winter and hiking, high altitude agricultural lakes, and dark stargazing skies during summer campouts.",
        externalUrl: "https://www.lebanontraveler.com/en/details/laklouk-summer-winter/"
      }
    ]
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

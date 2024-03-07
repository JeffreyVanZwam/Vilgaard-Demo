import RSS from "rss";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import "dayjs/locale/nl";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  const today = dayjs().locale("nl").valueOf().toString();
  const endOfToday = dayjs()
    .set("hour", 23)
    .set("minute", 59)
    .set("second", 59)
    .set("millisecond", 999)
    .locale("nl")
    .valueOf()
    .toString();

  const bookings = await prisma.Booking.findMany({
    orderBy: [
      {
        tsFrom: "asc",
      },
    ],
    include: {
      rooms: true,
    },
    where: {
      isExportable: true,
      tsFrom: {
        lte: endOfToday,
      },
      tsTo: {
        gte: today,
      },
      rooms: {
        some: {
          location: {
            visibleInFeed: {
              some: {
                name: "kleedkamers",
              },
            },
          },
        },
      },
    },
  }).then(async (res: JSON) => {
    await prisma.$disconnect();
    return res;
  });

  bookings.sort((a, b) => {
    return a.tsFrom - b.tsFrom;
  });

  const feed = new RSS({
    title: "De Vilgaard",
    site_url: "https://vilres.vilgaard.nl/",
    feed_url: `https://vilres.vilgaard.nl/rss/kleedkamers`,
    ttl: "60",
  });

  for (const booking of bookings) {
    feed.item({
      title: booking.name,
      description: booking.description,
      custom_elements: [
        {
          start_date: `${booking.dateFd}-${booking.dateFm}-${booking.dateFy}`,
        },
        {
          start_time: `${booking.dateFh}:${booking.dateFi}`,
        },
        {
          end_date: `${booking.dateTd}-${booking.dateTm}-${booking.dateTy}`,
        },
        {
          end_time: `${booking.dateTh}:${booking.dateTi}`,
        },
        {
          location:
            booking.rssLocation && booking.rssLocation != ""
              ? booking.rssLocation
              : booking.rooms[0].name,
        },
      ],
    });
  }

  const feedString = feed.xml({ indent: true }); //This returns the XML as a string.

  event.node.res.setHeader("content-type", "text/xml"); // we need to tell nitro to return this as a xml file
  event.node.res.end(feedString); // send the HTTP response

  //   return bookings;
});

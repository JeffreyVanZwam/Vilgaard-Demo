import ical from "ical-generator";
import http from "node:http";

import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const calendar = ical({ name: "my first iCal" });
  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  calendar.createEvent({
    start: startTime,
    end: endTime,
    summary: "Example Event",
    description: "It works ;)",
    location: "my room",
    url: "http://sebbo.net/",
  });

  http
    .createServer((req, res) => calendar.serve(res))
    .listen(3100, "127.0.0.1", () => {
      console.log("Server running at http://127.0.0.1:3100/");
    });

  //   const prisma = new PrismaClient();

  //   const today = new Date();
  //   const todayTS = today.getTime();

  //   const bookings = await prisma.Booking.findMany({
  //     include: {
  //       rooms: true,
  //       assemblee: {
  //         include: {
  //           assemblee: true,
  //         },
  //       },
  //     },
  //     where: {
  //       isExportable: true,
  //       tsTo: {
  //         gte: todayTS.toString(),
  //       },
  //     },
  //   }).then(async (res: JSON) => {
  //     await prisma.$disconnect();
  //     return res;
  //   });

  //   for (const booking of bookings) {

  //   }

  //   return bookings;
});

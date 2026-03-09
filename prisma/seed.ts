import { hash } from "argon2";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import "dotenv/config";
import { parse } from "date-fns";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    email: "juan_dela_cruz@dlsu.edu.ph",
    name: {
      first: "Juan",
      last: "Dela Cruz",
    },
    password: await hash("12345678"),
    description: "Student of DLSU",
  },
  {
    email: "joe_dela_cruz@dlsu.edu.ph",
    name: {
      first: "Joe",
      last: "Dela Cruz",
    },
    password: await hash("password"),
    description: "IT Employee",
    admin: true,
  },
  {
    email: "paityn_orr@dlsu.edu.ph",
    name: {
      first: "Paityn",
      last: "Orr",
    },
    password: await hash("123456789"),
    description: "Proud CCS Student",
  },
  {
    email: "benicio_mclean@dlsu.edu.ph",
    name: {
      first: "Benicio",
      last: "McLean",
    },
    password: await hash("00000000"),
    description: "ADSO Officer",
    admin: true,
  },
  {
    email: "amirah_colon@dlsu.edu.ph",
    name: {
      first: "Amirah",
      last: "Colon",
    },
    password: await hash("87654321"),
    description: "Epic gamer",
  },
];

const userIds = [];

for (const u of userData)
  userIds.push((await prisma.user.create({ data: u })).id);

const labData: Prisma.LabCreateInput[] = [
  {
    name: "GK203",
    weeklySchedule: {
      monday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      tuesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      thursday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      friday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      saturday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
    },
    slots: [
      { id: "1", x: 0, y: 0 },
      { id: "2", x: 1, y: 0 },
      { id: "3", x: 2, y: 0 },
      { id: "4", x: 3, y: 0 },
      { id: "5", x: 4, y: 0 },
      { id: "6", x: 5, y: 0 },
      { id: "7", x: 6, y: 0 },
      { id: "8", x: 7, y: 0 },
      { id: "9", x: 0, y: 1 },
      { id: "10", x: 1, y: 1 },
      { id: "11", x: 2, y: 1 },
      { id: "12", x: 3, y: 1 },
      { id: "13", x: 4, y: 1 },
      { id: "14", x: 5, y: 1 },
      { id: "15", x: 6, y: 1 },
      { id: "16", x: 7, y: 1 },
      { id: "17", x: 0, y: 2 },
      { id: "18", x: 1, y: 2 },
      { id: "19", x: 2, y: 2 },
      { id: "20", x: 3, y: 2 },
      { id: "21", x: 4, y: 2 },
      { id: "22", x: 5, y: 2 },
      { id: "23", x: 6, y: 2 },
      { id: "24", x: 7, y: 2 },
      { id: "25", x: 0, y: 3 },
      { id: "26", x: 1, y: 3 },
      { id: "27", x: 2, y: 3 },
      { id: "28", x: 3, y: 3 },
      { id: "29", x: 4, y: 3 },
      { id: "30", x: 5, y: 3 },
      { id: "31", x: 6, y: 3 },
      { id: "32", x: 7, y: 3 },
      { id: "33", x: 0, y: 4 },
      { id: "34", x: 1, y: 4 },
      { id: "35", x: 2, y: 4 },
      { id: "36", x: 3, y: 4 },
      { id: "37", x: 4, y: 4 },
      { id: "38", x: 5, y: 4 },
      { id: "39", x: 6, y: 4 },
      { id: "40", x: 7, y: 4 },
      { id: "41", x: 0, y: 5 },
      { id: "42", x: 1, y: 5 },
      { id: "43", x: 2, y: 5 },
      { id: "44", x: 3, y: 5 },
      { id: "45", x: 4, y: 5 },
      { id: "46", x: 5, y: 5 },
      { id: "47", x: 6, y: 5 },
      { id: "48", x: 7, y: 5 },
    ],
  },
  {
    name: "GK204",
    weeklySchedule: {
      monday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      tuesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      thursday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      friday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      saturday: {
        start: parse("09:30", "HH:mm", new Date(0)),
        end: parse("16:00", "HH:mm", new Date(0)),
      },
    },
    slots: [
      { id: "1", x: 1, y: 0 },
      { id: "2", x: 2, y: 0 },
      { id: "3", x: 3, y: 0 },
      { id: "4", x: 4, y: 0 },
      { id: "5", x: 0, y: 1 },
      { id: "6", x: 1, y: 1 },
      { id: "7", x: 2, y: 1 },
      { id: "8", x: 3, y: 1 },
      { id: "9", x: 4, y: 1 },
      { id: "10", x: 5, y: 1 },
      { id: "11", x: 0, y: 2 },
      { id: "12", x: 1, y: 2 },
      { id: "13", x: 2, y: 2 },
      { id: "14", x: 3, y: 2 },
      { id: "15", x: 4, y: 2 },
      { id: "16", x: 5, y: 2 },
      { id: "17", x: 0, y: 3 },
      { id: "18", x: 1, y: 3 },
      { id: "19", x: 2, y: 3 },
      { id: "20", x: 3, y: 3 },
      { id: "21", x: 4, y: 3 },
      { id: "22", x: 5, y: 3 },
      { id: "23", x: 0, y: 4 },
      { id: "24", x: 1, y: 4 },
      { id: "25", x: 2, y: 4 },
      { id: "26", x: 3, y: 4 },
      { id: "27", x: 4, y: 4 },
      { id: "28", x: 5, y: 4 },
    ],
  },
  {
    name: "GK302A",
    weeklySchedule: {
      monday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      tuesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      thursday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      friday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      saturday: {
        start: parse("09:30", "HH:mm", new Date(0)),
        end: parse("16:00", "HH:mm", new Date(0)),
      },
    },
    slots: [
      { id: "1", x: 0, y: 0 },
      { id: "2", x: 1, y: 0 },
      { id: "3", x: 2, y: 0 },
      { id: "4", x: 3, y: 0 },
      { id: "5", x: 4, y: 0 },
      { id: "6", x: 5, y: 0 },
      { id: "7", x: 0, y: 1 },
      { id: "8", x: 1, y: 1 },
      { id: "9", x: 2, y: 1 },
      { id: "10", x: 3, y: 1 },
      { id: "11", x: 4, y: 1 },
      { id: "12", x: 5, y: 1 },
      { id: "13", x: 0, y: 2 },
      { id: "14", x: 1, y: 2 },
      { id: "15", x: 2, y: 2 },
      { id: "16", x: 3, y: 2 },
      { id: "17", x: 4, y: 2 },
      { id: "18", x: 5, y: 2 },
      { id: "19", x: 0, y: 3 },
      { id: "20", x: 1, y: 3 },
      { id: "21", x: 2, y: 3 },
      { id: "22", x: 3, y: 3 },
      { id: "23", x: 4, y: 3 },
      { id: "24", x: 5, y: 3 },
      { id: "25", x: 0, y: 4 },
      { id: "26", x: 1, y: 4 },
      { id: "27", x: 2, y: 4 },
      { id: "28", x: 3, y: 4 },
      { id: "29", x: 4, y: 4 },
      { id: "30", x: 5, y: 4 },
      { id: "31", x: 0, y: 5 },
      { id: "32", x: 1, y: 5 },
      { id: "33", x: 2, y: 5 },
      { id: "34", x: 3, y: 5 },
      { id: "35", x: 4, y: 5 },
      { id: "36", x: 5, y: 5 },
      { id: "37", x: 0, y: 6 },
      { id: "38", x: 1, y: 6 },
      { id: "39", x: 2, y: 6 },
      { id: "40", x: 3, y: 6 },
      { id: "41", x: 4, y: 6 },
      { id: "42", x: 5, y: 6 },
    ],
  },
  {
    name: "GK302B",
    weeklySchedule: {
      monday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      tuesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      wednesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      thursday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      friday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      saturday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
    },
    slots: [
      { id: "1", x: 0, y: 0 },
      { id: "2", x: 1, y: 0 },
      { id: "3", x: 2, y: 0 },
      { id: "4", x: 3, y: 0 },
      { id: "5", x: 0, y: 1 },
      { id: "6", x: 1, y: 1 },
      { id: "7", x: 2, y: 1 },
      { id: "8", x: 3, y: 1 },
      { id: "9", x: 0, y: 2 },
      { id: "10", x: 1, y: 2 },
      { id: "11", x: 2, y: 2 },
      { id: "12", x: 3, y: 2 },
      { id: "13", x: 0, y: 3 },
      { id: "14", x: 1, y: 3 },
      { id: "15", x: 2, y: 3 },
      { id: "16", x: 3, y: 3 },
    ],
  },
  {
    name: "GK304A",
    weeklySchedule: {
      monday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      tuesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      wednesday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      thursday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      friday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
      saturday: {
        start: parse("07:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)),
      },
    },
    slots: [
      { id: "1", x: 1, y: 0 },
      { id: "2", x: 2, y: 0 },
      { id: "3", x: 3, y: 0 },
      { id: "4", x: 4, y: 0 },
      { id: "5", x: 0, y: 1 },
      { id: "6", x: 1, y: 1 },
      { id: "7", x: 2, y: 1 },
      { id: "8", x: 3, y: 1 },
      { id: "9", x: 4, y: 1 },
      { id: "10", x: 5, y: 1 },
      { id: "11", x: 6, y: 1 },
      { id: "12", x: 7, y: 1 },
      { id: "13", x: 0, y: 2 },
      { id: "14", x: 1, y: 2 },
      { id: "15", x: 2, y: 2 },
      { id: "16", x: 3, y: 2 },
      { id: "17", x: 4, y: 2 },
      { id: "18", x: 5, y: 2 },
      { id: "19", x: 6, y: 2 },
      { id: "20", x: 7, y: 2 },
      { id: "21", x: 0, y: 3 },
      { id: "22", x: 1, y: 3 },
      { id: "23", x: 2, y: 3 },
      { id: "24", x: 3, y: 3 },
      { id: "25", x: 4, y: 3 },
      { id: "26", x: 5, y: 3 },
      { id: "27", x: 6, y: 3 },
      { id: "28", x: 7, y: 3 },
      { id: "29", x: 0, y: 4 },
      { id: "30", x: 1, y: 4 },
      { id: "31", x: 2, y: 4 },
      { id: "32", x: 3, y: 4 },
      { id: "33", x: 4, y: 4 },
      { id: "34", x: 5, y: 4 },
      { id: "35", x: 6, y: 4 },
      { id: "36", x: 7, y: 4 },
      { id: "37", x: 0, y: 5 },
      { id: "38", x: 1, y: 5 },
      { id: "39", x: 2, y: 5 },
      { id: "40", x: 3, y: 5 },
      { id: "41", x: 4, y: 5 },
      { id: "42", x: 5, y: 5 },
      { id: "43", x: 6, y: 5 },
    ],
  },
];

const labIds = [];
for (const l of labData) labIds.push((await prisma.lab.create({ data: l })).id);

const reservationData: Prisma.ReservationCreateInput[] = [
  {
    user: { connect: { id: userIds[0] } },
    lab: { connect: { id: labIds[0] } },
    schedule: {
      start: parse("07:30", "HH:mm", new Date()),
      end: parse("17:00", "HH:mm", new Date()),
    },
    slotIds: ["1", "2", "3"],
  },
  {
    user: { connect: { id: userIds[1] } },
    lab: { connect: { id: labIds[0] } },
    anonymous: true,
    schedule: {
      start: parse("16:00", "HH:mm", new Date()),
      end: parse("18:00", "HH:mm", new Date()),
    },
    slotIds: ["11", "12", "13", "14", "15"],
  },
  {
    user: { connect: { id: userIds[2] } },
    lab: { connect: { id: labIds[0] } },
    schedule: {
      start: parse("9:00", "HH:mm", new Date()),
      end: parse("14:00", "HH:mm", new Date()),
    },
    slotIds: ["5", "6", "7"],
  },
  {
    user: { connect: { id: userIds[3] } },
    lab: { connect: { id: labIds[1] } },
    schedule: {
      start: parse("07:30", "HH:mm", new Date()),
      end: parse("14:30", "HH:mm", new Date()),
    },
    slotIds: ["4", "5", "6", "7"],
  },
  {
    user: { connect: { id: userIds[4] } },
    lab: { connect: { id: labIds[1] } },
    schedule: {
      start: parse("12:00", "HH:mm", new Date()),
      end: parse("17:30", "HH:mm", new Date()),
    },
    slotIds: ["14", "15", "17", "18"],
  },
];

for (const r of reservationData) await prisma.reservation.create({ data: r });

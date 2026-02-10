import { Interval } from "date-fns";
import { isAfter } from "date-fns/isAfter";
import { parse } from "date-fns/parse";

type User = {
  id: number;
  email: string;
  name: { first: string; last: string };
  password: string;
  admin?: true;
};

type Lab = {
  id: number;
  name: string;
  weeklySchedule: Partial<
    Record<
      | "sunday"
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday",
      Interval
    >
  >;
  slots: { id: number; x: number; y: number }[];
};

type Reservation = {
  id: number;
  userId: number;
  labId: number;
  anonymous?: true;
  schedule: Interval;
  slotIds: number[];
};

export const users: User[] = [
  {
    id: 1,
    email: "juan_dela_cruz@dlsu.edu.ph",
    name: {
      first: "Juan",
      last: "Dela Cruz",
    },
    password: "password",
  },
  {
    id: 2,
    email: "joe_dela_cruz@dlsu.edu.ph",
    name: {
      first: "Joe",
      last: "Dela Cruz",
    },
    password: "password",
    admin: true,
  },
  {
    id: 3,
    email: "paityn_orr@dlsu.edu.ph",
    name: {
      first: "Paityn",
      last: "Orr",
    },
    password: "123456",
  },
  {
    id: 4,
    email: "benicio_mclean@dlsu.edu.ph",
    name: {
      first: "Benicio",
      last: "McLean",
    },
    password: "000000",
    admin: true,
  },
  {
    id: 5,
    email: "amirah_colon@dlsu.edu.ph",
    name: {
      first: "Amirah",
      last: "Colon",
    },
    password: "654321",
  },
];

const labs: Lab[] = [
  {
    id: 1,
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
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 0 },
      { id: 3, x: 2, y: 0 },
      { id: 4, x: 3, y: 0 },
      { id: 5, x: 4, y: 0 },
      { id: 6, x: 5, y: 0 },
      { id: 7, x: 6, y: 0 },
      { id: 8, x: 7, y: 0 },
      { id: 9, x: 0, y: 1 },
      { id: 10, x: 1, y: 1 },
      { id: 11, x: 2, y: 1 },
      { id: 12, x: 3, y: 1 },
      { id: 13, x: 4, y: 1 },
      { id: 14, x: 5, y: 1 },
      { id: 15, x: 6, y: 1 },
      { id: 16, x: 7, y: 1 },
      { id: 17, x: 0, y: 2 },
      { id: 18, x: 1, y: 2 },
      { id: 19, x: 2, y: 2 },
      { id: 20, x: 3, y: 2 },
      { id: 21, x: 4, y: 2 },
      { id: 22, x: 5, y: 2 },
      { id: 23, x: 6, y: 2 },
      { id: 24, x: 7, y: 2 },
      { id: 25, x: 0, y: 3 },
      { id: 26, x: 1, y: 3 },
      { id: 27, x: 2, y: 3 },
      { id: 28, x: 3, y: 3 },
      { id: 29, x: 4, y: 3 },
      { id: 30, x: 5, y: 3 },
      { id: 31, x: 6, y: 3 },
      { id: 32, x: 7, y: 3 },
      { id: 33, x: 0, y: 4 },
      { id: 34, x: 1, y: 4 },
      { id: 35, x: 2, y: 4 },
      { id: 36, x: 3, y: 4 },
      { id: 37, x: 4, y: 4 },
      { id: 38, x: 5, y: 4 },
      { id: 39, x: 6, y: 4 },
      { id: 40, x: 7, y: 4 },
      { id: 41, x: 0, y: 5 },
      { id: 42, x: 1, y: 5 },
      { id: 43, x: 2, y: 5 },
      { id: 44, x: 3, y: 5 },
      { id: 45, x: 4, y: 5 },
      { id: 46, x: 5, y: 5 },
      { id: 47, x: 6, y: 5 },
      { id: 48, x: 7, y: 5 },
    ],
  },
  {
    id: 2,
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
      { id: 1, x: 1, y: 0 },
      { id: 2, x: 2, y: 0 },
      { id: 3, x: 3, y: 0 },
      { id: 4, x: 4, y: 0 },
      { id: 5, x: 0, y: 1 },
      { id: 6, x: 1, y: 1 },
      { id: 7, x: 2, y: 1 },
      { id: 8, x: 3, y: 1 },
      { id: 9, x: 4, y: 1 },
      { id: 10, x: 5, y: 1 },
      { id: 11, x: 0, y: 2 },
      { id: 12, x: 1, y: 2 },
      { id: 13, x: 2, y: 2 },
      { id: 14, x: 3, y: 2 },
      { id: 15, x: 4, y: 2 },
      { id: 16, x: 5, y: 2 },
      { id: 17, x: 0, y: 3 },
      { id: 18, x: 1, y: 3 },
      { id: 19, x: 2, y: 3 },
      { id: 20, x: 3, y: 3 },
      { id: 21, x: 4, y: 3 },
      { id: 22, x: 5, y: 3 },
      { id: 23, x: 0, y: 4 },
      { id: 24, x: 1, y: 4 },
      { id: 25, x: 2, y: 4 },
      { id: 26, x: 3, y: 4 },
      { id: 27, x: 4, y: 4 },
      { id: 28, x: 5, y: 4 },
    ],
  },
  {
    id: 3,
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
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 0 },
      { id: 3, x: 2, y: 0 },
      { id: 4, x: 3, y: 0 },
      { id: 5, x: 4, y: 0 },
      { id: 6, x: 5, y: 0 },
      { id: 7, x: 0, y: 1 },
      { id: 8, x: 1, y: 1 },
      { id: 9, x: 2, y: 1 },
      { id: 10, x: 3, y: 1 },
      { id: 11, x: 4, y: 1 },
      { id: 12, x: 5, y: 1 },
      { id: 13, x: 0, y: 2 },
      { id: 14, x: 1, y: 2 },
      { id: 15, x: 2, y: 2 },
      { id: 16, x: 3, y: 2 },
      { id: 17, x: 4, y: 2 },
      { id: 18, x: 5, y: 2 },
      { id: 19, x: 0, y: 3 },
      { id: 20, x: 1, y: 3 },
      { id: 21, x: 2, y: 3 },
      { id: 22, x: 3, y: 3 },
      { id: 23, x: 4, y: 3 },
      { id: 24, x: 5, y: 3 },
      { id: 25, x: 0, y: 4 },
      { id: 26, x: 1, y: 4 },
      { id: 27, x: 2, y: 4 },
      { id: 28, x: 3, y: 4 },
      { id: 29, x: 4, y: 4 },
      { id: 30, x: 5, y: 4 },
      { id: 31, x: 0, y: 5 },
      { id: 32, x: 1, y: 5 },
      { id: 33, x: 2, y: 5 },
      { id: 34, x: 3, y: 5 },
      { id: 35, x: 4, y: 5 },
      { id: 36, x: 5, y: 5 },
      { id: 37, x: 0, y: 6 },
      { id: 38, x: 1, y: 6 },
      { id: 39, x: 2, y: 6 },
      { id: 40, x: 3, y: 6 },
      { id: 41, x: 4, y: 6 },
      { id: 42, x: 5, y: 6 },
    ],
  },
  {
    id: 4,
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
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 0 },
      { id: 3, x: 2, y: 0 },
      { id: 4, x: 3, y: 0 },
      { id: 5, x: 0, y: 1 },
      { id: 6, x: 1, y: 1 },
      { id: 7, x: 2, y: 1 },
      { id: 8, x: 3, y: 1 },
      { id: 9, x: 0, y: 2 },
      { id: 10, x: 1, y: 2 },
      { id: 11, x: 2, y: 2 },
      { id: 12, x: 3, y: 2 },
      { id: 13, x: 0, y: 3 },
      { id: 14, x: 1, y: 3 },
      { id: 15, x: 2, y: 3 },
      { id: 16, x: 3, y: 3 },
    ],
  },
  {
    id: 5,
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
      { id: 1, x: 1, y: 0 },
      { id: 2, x: 2, y: 0 },
      { id: 3, x: 3, y: 0 },
      { id: 4, x: 4, y: 0 },
      { id: 5, x: 0, y: 1 },
      { id: 6, x: 1, y: 1 },
      { id: 7, x: 2, y: 1 },
      { id: 8, x: 3, y: 1 },
      { id: 9, x: 4, y: 1 },
      { id: 10, x: 5, y: 1 },
      { id: 11, x: 6, y: 1 },
      { id: 12, x: 7, y: 1 },
      { id: 13, x: 0, y: 2 },
      { id: 14, x: 1, y: 2 },
      { id: 15, x: 2, y: 2 },
      { id: 16, x: 3, y: 2 },
      { id: 17, x: 4, y: 2 },
      { id: 18, x: 5, y: 2 },
      { id: 19, x: 6, y: 2 },
      { id: 20, x: 7, y: 2 },
      { id: 21, x: 0, y: 3 },
      { id: 22, x: 1, y: 3 },
      { id: 23, x: 2, y: 3 },
      { id: 24, x: 3, y: 3 },
      { id: 25, x: 4, y: 3 },
      { id: 26, x: 5, y: 3 },
      { id: 27, x: 6, y: 3 },
      { id: 28, x: 7, y: 3 },
      { id: 29, x: 0, y: 4 },
      { id: 30, x: 1, y: 4 },
      { id: 31, x: 2, y: 4 },
      { id: 32, x: 3, y: 4 },
      { id: 33, x: 4, y: 4 },
      { id: 34, x: 5, y: 4 },
      { id: 35, x: 6, y: 4 },
      { id: 36, x: 7, y: 4 },
      { id: 37, x: 0, y: 5 },
      { id: 38, x: 1, y: 5 },
      { id: 39, x: 2, y: 5 },
      { id: 40, x: 3, y: 5 },
      { id: 41, x: 4, y: 5 },
      { id: 42, x: 5, y: 5 },
      { id: 43, x: 6, y: 5 },
    ],
  },
];

const reservations: Reservation[] = [
  {
    id: 1,
    userId: 1,
    labId: 1,
    schedule: {
      start: parse("07:30", "HH:mm", new Date()),
      end: parse("17:00", "HH:mm", new Date()),
    },
    slotIds: [1, 2, 3],
  },
  {
    id: 2,
    userId: 2,
    labId: 1,
    anonymous: true,
    schedule: {
      start: parse("16:00", "HH:mm", new Date()),
      end: parse("18:00", "HH:mm", new Date()),
    },
    slotIds: [11, 12, 13, 14, 15],
  },
  {
    id: 3,
    userId: 3,
    labId: 1,
    schedule: {
      start: parse("9:00", "HH:mm", new Date()),
      end: parse("14:00", "HH:mm", new Date()),
    },
    slotIds: [5, 6, 7],
  },
  {
    id: 4,
    userId: 4,
    labId: 2,
    schedule: {
      start: parse("07:30", "HH:mm", new Date()),
      end: parse("14:30", "HH:mm", new Date()),
    },
    slotIds: [4, 5, 6, 7],
  },
  {
    id: 5,
    userId: 5,
    labId: 2,
    schedule: {
      start: parse("12:00", "HH:mm", new Date()),
      end: parse("17:30", "HH:mm", new Date()),
    },
    slotIds: [14, 15, 17, 18],
  },
];

export function login(): Pick<User, "id" | "admin"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name, ...user } = getUser(1)!;
  return user;
}

export function getUser(
  id: number,
): Omit<User, "password" | "email"> | undefined {
  const user = users.find((value) => value.id === id);

  if (!user) return undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...filtered } = user;
  return filtered;
}

export function getLabs(name: string) {
  return labs.filter((value) =>
    value.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
  );
}

export function getLab(id: number) {
  return labs.find((value) => value.id === id);
}

export function getReservationsFromLab(
  labId: number,
  loginId?: number,
): (Reservation & Partial<Record<"editable", true>>)[] | undefined {
  const isAdmin = !!(loginId && getUser(loginId)?.admin);

  return reservations
    .filter(
      (value) =>
        value.labId === labId && isAfter(value.schedule.end, new Date()),
    )
    .map((value) => ({
      editable: value.userId === loginId || isAdmin || undefined,
      ...value,
      userId: value.anonymous ? 0 : value.userId,
    }));
}

export function getReservationsFromUser(
  userId: number,
  loginId?: number,
): (Reservation & Partial<Record<"editable", true>>)[] | undefined {
  const isAdmin = !!(loginId && getUser(loginId)?.admin);

  return reservations
    .filter(
      (value) =>
        value.userId === userId &&
        (!value.anonymous || value.userId === loginId || isAdmin) &&
        isAfter(value.schedule.end, new Date()),
    )
    .map((value) => ({
      editable: value.userId === loginId || isAdmin || undefined,
      ...value,
      userId: value.anonymous ? 0 : value.userId,
    }));
}

export function deleteReservation(id: number, loginId: number) {
  const reservation = reservations.find((value) => value.id === id);

  if (
    reservation &&
    (getUser(loginId)?.admin || getUser(reservation.userId)?.id === loginId)
  ) {
    reservations.splice(
      reservations.findIndex((value) => value.id === reservation.id),
    );
  }
}

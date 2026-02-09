import { Interval } from "date-fns";
import { setHours } from "date-fns/setHours";
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

const users: User[] = [{
  id: 1,
  email: "juan_dela_cruz@dlsu.edu.ph",
  name: {
    first: "Juan",
    last: "Dela Cruz",
  },
  password: "password",
}, {
  id: 2,
  email: "joe_dela_cruz@dlsu.edu.ph",
  name: {
    first: "Joe",
    last: "Dela Cruz",
  },
  password: "password",
  admin: true,
}, {
  id: 3,
  email: "paityn_orr@dlsu.edu.ph",
  name: {
    first: "Paityn",
    last: "Orr",
  },
  password: "123456",
}, {
  id: 4,
  email: "benicio_mclean@dlsu.edu.ph",
  name: {
    first: "Benicio",
    last: "McLean",
  },
  password: "000000",
  admin: true,
}, {
  id: 5,
  email: "amirah_colon@dlsu.edu.ph",
  name: {
    first: "Amirah",
    last: "Colon",
  },
  password: "654321",
}];

const labs: Lab[] = [
  {
    id: 1,
    name: "GK203",
    weeklySchedule: {
      monday: {
        start: parse("07:00", "HH:mm", new Date(0)),
        end: parse("23:00", "HH:mm", new Date(0)),
      },
    },
    slots: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 1, y: 0 }, {
      id: 3,
      x: 5,
      y: 1,
    }],
  },
  {
    id: 2,
    name: "GK204",
    weeklySchedule: {
      monday: {
        start: parse("08:00", "HH:mm", new Date(0)),
        end: parse("16:00", "HH:mm", new Date(0)),
      },
    },
    slots: [{ id: 1, x: 0, y: 1 }, { id: 2, x: 1, y: 0 }],
  },
  {
    id: 3,
    name: "GK302A",
    weeklySchedule: {
      tuesday: {
        start: parse("13:00", "HH:mm", new Date(0)),
        end: parse("17:00", "HH:mm", new Date(0)),
      },
      wednesday: {
        start: parse("7:30", "HH:mm", new Date(0)),
        end: parse("18:00", "HH:mm", new Date(0)), 
      },
    },
    slots: [{ id: 4, x: 0, y: 1}],
  },
  {
    id: 4,
    name: "GK302B",
    weeklySchedule: {
      thursday: {
        start: parse("12:00", "HH:mm", new Date(0)),
        end: parse("16:30", "HH:mm", new Date(0)),
      },
    },
    slots: [{ id: 5, x: 0, y: 1}, {id: 4, x: 2, y:1],
  },
  {
    id: 5,
    name: "GK304A",
    weeklySchedule: {
      friday: {
        start: parse("7:30", "HH:mm", new Date(0)),
        end: parse("12:00", "HH:mm", new Date(0)), 
      },
    },
    slots: [{ id: 5, x: 0, y: 1}],

  },
];

const reservations: Reservation[] = [
  {
    id: 1,
    userId: 1,
    labId: 1,
    schedule: {
      start: parse("11:00", "HH:mm", new Date()),
      end: parse("19:00", "HH:mm", new Date()),
    },
    slotIds: [1],
  },
  {
    id: 2,
    userId: 2,
    labId: 1,
    anonymous: true,
    schedule: {
      start: parse("19:00", "HH:mm", new Date()),
      end: parse("20:00", "HH:mm", new Date()),
    },
    slotIds: [1, 2],
  },
  {
    id: 3,
    userId: 3,
    labId: 2,
    anonymous: true,
    schedule: {
      start: parse("9:00", "HH:mm", new Date()),
      end: parse("14:00", "HH:mm", new Date()),
    },
    slotIds: [1],
  },
  {
    id: 4,
    userId: 4,
    labId: 3,
    schedule: {
      start: parse("12:30", "HH:mm", new Date()),
      end: parse("15:00", "HH:mm", new Date()),
    },
    slotIds: [4],
  },
  {
    id: 5,
    userId: 5,
    labId: 4,
    schedule: {
      start: parse("9:30", "HH:mm", new Date()),
      end: parse("17:30", "HH:mm", new Date()),
    },
    slotIds: [3],
  },
];

export function login(): Pick<User, "id" | "admin"> {
  // deno-lint-ignore no-unused-vars
  const { name, ...user } = getUser(1)!;
  return user;
}

export function getUser(
  id: number,
): Omit<User, "password" | "email"> | undefined {
  const user = users.find((value) => value.id === id);

  if (!user) return undefined;

  // deno-lint-ignore no-unused-vars
  const { password, ...filtered } = user;
  return filtered;
}

export function getLabs(name: string) {
  return labs.filter((value) =>
    value.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
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

  return reservations.filter((value) =>
    value.labId === labId &&
    isAfter(value.schedule.end, new Date())
  ).map((
    value,
  ) => ({
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

  return reservations.filter((value) =>
    value.userId === userId &&
    (!value.anonymous || value.userId === loginId || isAdmin) &&
    isAfter(value.schedule.end, new Date())
  ).map((
    value,
  ) => ({
    editable: value.userId === loginId || isAdmin || undefined,
    ...value,
    userId: value.anonymous ? 0 : value.userId,
  }));
}

export function deleteReservation(id: number, loginId: number) {
  const reservation = reservations.find((value) => value.id === id);

  if (
    reservation &&
    (getUser(loginId)?.admin ||
      getUser(reservation.userId)?.id === loginId)
  ) {
    reservations.splice(
      reservations.findIndex((value) => value.id === reservation.id),
    );
  }
}

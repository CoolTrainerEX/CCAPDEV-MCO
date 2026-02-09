import { Interval } from "date-fns";
import { setHours } from "date-fns/setHours";
import { isAfter } from "date-fns/isAfter";

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
}];

const labs: Lab[] = [
  {
    id: 1,
    name: "GK203",
    weeklySchedule: {
      monday: {
        start: setHours(new Date(0), 8),
        end: setHours(new Date(0), 23),
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
        start: setHours(new Date(0), 8),
        end: setHours(new Date(0), 16),
      },
    },
    slots: [{ id: 1, x: 0, y: 1 }, { id: 2, x: 1, y: 0 }],
  },
];

const reservations: Reservation[] = [
  {
    id: 1,
    userId: 1,
    labId: 1,
    schedule: {
      start: setHours(new Date(), 19),
      end: setHours(new Date(), 20),
    },
    slotIds: [1],
  },
  {
    id: 2,
    userId: 2,
    labId: 2,
    anonymous: true,
    schedule: {
      start: setHours(new Date(), 11),
      end: setHours(new Date(), 20),
    },
    slotIds: [1, 2],
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

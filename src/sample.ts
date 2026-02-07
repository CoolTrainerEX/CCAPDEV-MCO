type Schedule = { start: Date; end: Date };

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
    weeklySched: Partial<
        Record<
            | "sunday"
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | "saturday",
            Schedule
        >
    >;
    slots: { id: number; x: number; y: number }[];
};

type Reservation = {
    userId: number;
    labId: number;
    anonymous?: true;
    schedule: Schedule;
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
        weeklySched: {
            saturday: {
                start: (() => {
                    const date = new Date();

                    date.setHours(8, 0);
                    return date;
                })(),
                end: (() => {
                    const date = new Date();

                    date.setHours(16, 0);
                    return date;
                })(),
            },
        },
        slots: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 1, y: 0 }],
    },
    {
        id: 2,
        name: "GK204",
        weeklySched: {},
        slots: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 1, y: 0 }],
    },
];

const reservations: Reservation[] = [
    {
        userId: 1,
        labId: 1,
        schedule: {
            start: (() => {
                const date = new Date();

                date.setHours(1, 0);
                return date;
            })(),
            end: (() => {
                const date = new Date();

                date.setHours(23, 0);
                return date;
            })(),
        },
        slotIds: [1, 2],
    },
    {
        userId: 2,
        labId: 1,
        anonymous: true,
        schedule: {
            start: (() => {
                const date = new Date();

                date.setHours(13, 0);
                return date;
            })(),
            end: (() => {
                const date = new Date();

                date.setHours(14, 0);
                return date;
            })(),
        },
        slotIds: [2],
    },
];

export function login(): Pick<User, "id" | "admin"> {
    // deno-lint-ignore no-unused-vars
    const { email, name, ...user } = getUser(1)!;
    return user;
}

export function getUser(id: number): Omit<User, "password"> | undefined {
    const user = users.find((value) => value.id === id);

    if (!user) return undefined;

    // deno-lint-ignore no-unused-vars
    const { password, ...filtered } = user;
    return filtered;
}

export function getLabs() {
    return labs;
}

export function getLab(id: number) {
    return labs.find((value) => value.id === id);
}

export function getReservationsFromLab(
    labId: number,
    loginId: number,
): (Reservation & { editable?: true })[] | undefined {
    return reservations.filter((value) => value.labId === labId).map((
        value,
    ) => ({
        editable: value.userId === loginId || getUser(loginId)?.admin ||
            undefined,
        ...value,
        userId: value.anonymous ? 0 : value.userId,
    }));
}

export function getReservationsFromUser(
    userId: number,
    loginId: number,
): (Reservation & { editable?: true })[] | undefined {
    return reservations.filter((value) => value.userId === userId).map((
        value,
    ) => ({
        editable: value.userId === loginId || getUser(loginId)?.admin ||
            undefined,
        ...value,
        userId: value.anonymous ? 0 : value.userId,
    }));
}

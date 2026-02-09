import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer.tsx";
import Form from "next/form";
import TimeRangeInput from "./time-range-input.tsx";
import {
  deleteReservation,
  getLab,
  getReservationsFromLab,
  getUser,
} from "@/src/sample.ts";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getHours,
  getMinutes,
  Interval,
  isAfter,
  max,
  roundToNearestMinutes,
  setHours,
  setMinutes,
  startOfDay,
  toDate,
} from "date-fns";
import { areIntervalsOverlapping } from "date-fns/areIntervalsOverlapping";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import useLogin from "@/src/store/login.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import Slots from "./slots.tsx";
import { useRouter } from "next/navigation";
import { Toggle } from "@/components/ui/toggle.tsx";

export function onPressedChange(
  setSelected: Dispatch<SetStateAction<number[]>>,
  slotId: number,
) {
  return (pressed: boolean) =>
    setSelected((value) =>
      pressed ? [slotId, ...value] : value.filter((value) => value !== slotId)
    );
}

export default function Reservation(
  { children, reservation, ...props }: Parameters<typeof Drawer>[0] & {
    reservation?: NonNullable<
      ReturnType<typeof getReservationsFromLab>
    >[number];
  },
) {
  const router = useRouter();
  const loginId = useLogin(({ id }) => id);
  const now = new Date();

  const [formSchedule, setFormSchedule] = useState<Interval>(
    reservation
      ? {
        start: new Date(reservation.schedule.start),
        end: new Date(reservation.schedule.end),
      }
      : { start: new Date(now), end: new Date(now) },
  );

  const [selected, setSelected] = useState(
    reservation ? reservation.slotIds : [],
  );

  if (!reservation) return <>{children}</>;

  const lab = getLab(reservation.labId);

  if (!lab) throw new Error(`Invalid Lab ID ${reservation.labId}`);

  const reservations = getReservationsFromLab(lab.id)?.filter(({ id }) =>
    id !== reservation.id
  );

  const rawSchedule = lab.weeklySchedule[
    ([
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as (keyof typeof lab.weeklySchedule)[])[
      startOfDay(reservation.schedule.start).getDay()
    ]
  ];

  let schedule = rawSchedule && {
    start: max([
      setMinutes(
        setHours(
          new Date(reservation.schedule.start),
          getHours(rawSchedule.start),
        ),
        getMinutes(rawSchedule.start),
      ),
      roundToNearestMinutes(now, { nearestTo: 30, roundingMethod: "ceil" }),
    ]),
    end: setMinutes(
      setHours(new Date(reservation.schedule.end), getHours(rawSchedule.end)),
      getMinutes(rawSchedule.end),
    ),
  };

  if (schedule && isAfter(schedule.start, schedule.end)) schedule = undefined;

  return (
    <Drawer {...props}>
      {children}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit Reservation</DrawerTitle>
            <DrawerDescription>
              <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
            </DrawerDescription>
          </DrawerHeader>
          <Form action="/" formMethod="post">
            <div className="flex flex-col gap-6 p-4 pb-0">
              <Slots
                className="min-h-50 max-h-96"
                slots={lab.slots}
              >
                {({ id }) => {
                  const reservation = reservations?.filter(({ schedule }) =>
                    areIntervalsOverlapping(schedule, formSchedule)
                  ).find(({ slotIds }) => slotIds.includes(id));

                  return (
                    <Toggle
                      disabled={!!reservation}
                      className={cn(
                        "w-full h-full flex justify-center items-center",
                        reservation
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                      pressed={selected.includes(id)}
                      onPressedChange={onPressedChange(setSelected, id)}
                      aria-label="Toggle Slot"
                      asChild
                    >
                    </Toggle>
                  );
                }}
              </Slots>
              <TimeRangeInput
                schedule={schedule}
                value={formSchedule}
                onValueChange={setFormSchedule}
                valid={!reservations?.filter(({ slotIds }) =>
                  slotIds.some((value) => selected.includes(value))
                ).some(({ schedule }) =>
                  areIntervalsOverlapping(schedule, formSchedule)
                )}
              />
            </div>
            <DrawerFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your reservation from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteReservation(reservation.id, loginId);
                        router.refresh();
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DrawerClose asChild>
                <Button variant="outline" type="reset">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function ReservationContent(
  { className, reservation, ...props }: React.ComponentProps<"div"> & {
    reservation: NonNullable<
      ReturnType<typeof getReservationsFromLab>
    >[number];
  },
) {
  const user = reservation.anonymous
    ? { name: { first: "Anonymous", last: "" } }
    : getUser(reservation.userId);

  const lab = getLab(reservation.labId);

  if (!user) throw new Error(`Invalid user ID ${reservation.userId}.`);
  if (!lab) throw new Error(`Invalid Lab ID ${reservation.labId}`);

  const [format, setFormat] = useState<Intl.DateTimeFormat | undefined>(
    undefined,
  );

  useEffect(() => {
    setFormat(Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }));
  }, []);

  return (
    <Card className={cn("w-full max-w-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>
          <Link href={`/user/${reservation.userId}`}>
            {[user.name.first, user.name.last].join(
              " ",
            )}
          </Link>
        </CardTitle>
        <CardDescription>
          <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
        </CardDescription>
        {reservation.editable &&
          (
            <CardAction>
              <DrawerTrigger asChild>
                <Button variant="link">Edit</Button>
              </DrawerTrigger>
            </CardAction>
          )}
      </CardHeader>
      <CardContent>
        <Slots
          className="aspect-video"
          slots={lab.slots}
        >
          {({ id }) => (
            <div
              className={cn(
                "h-full",
                reservation.slotIds.includes(id) ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </Slots>
      </CardContent>
      <CardFooter>
        {format?.formatRange(
          toDate(reservation.schedule.start),
          toDate(reservation.schedule.end),
        )}
      </CardFooter>
    </Card>
  );
}

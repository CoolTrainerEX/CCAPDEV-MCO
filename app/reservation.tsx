import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Form from "next/form";
import TimeRangeInput from "./time-range-input";
import React, { Dispatch, SetStateAction, useState } from "react";
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
  areIntervalsOverlapping,
} from "date-fns";
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
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Slots from "./slots";
import { Toggle } from "@/components/ui/toggle";
import {
  DeleteReservationParams,
  ReadReservationLabParams,
  ReadReservationLabResponse,
  ReadReservationLabResponseItem,
  UpdateReservationBody,
  UpdateReservationParams,
} from "@/src/api/endpoints/reservation/reservation.zod";
import z from "zod";
import {
  useDeleteReservation,
  useReadReservationLab,
  useUpdateReservation,
} from "@/src/api/endpoints/reservation/reservation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { readLabResponse, useReadLab } from "@/src/api/endpoints/lab/lab";
import {
  ReadLabParams,
  ReadLabResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import { useReadUser } from "@/src/api/endpoints/user/user";
import {
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import { Spinner } from "@/components/ui/spinner";

/**
 * Modify selected on toggle.
 * @param {Dispatch<SetStateAction<string[]>>} setSelected Selected state set
 * @param {string} slotId Slot ID
 * @returns {(pressed: boolean) => void} Function to run
 * @author Justin Ryan Uy
 */
export function onPressedChange(
  setSelected: Dispatch<SetStateAction<string[]>>,
  slotId: string,
) {
  return (pressed: boolean) =>
    setSelected((value) =>
      pressed ? [slotId, ...value] : value.filter((value) => value !== slotId),
    );
}

/**
 * Parses the lab from the query.
 * @param {ReturnType<typeof useReadLab>} labQuery Lab query
 * @returns {z.infer<typeof ReadLabResponse> | undefined} Parsed lab
 */
function getLab(labQuery: ReturnType<typeof useReadLab<readLabResponse>>) {
  if (labQuery.isSuccess)
    switch (labQuery.data.status) {
      case 200:
        try {
          return ReadLabResponse.parse(labQuery.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(labQuery.data.data.message);
        break;

      case 500:
        toast.warning(labQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }
}

// eslint-disable-next-line jsdoc/require-returns
/**
 * Reservation wrapper for {@link Drawer} functionality.
 * @param {Parameters<typeof Drawer>[0]} param0 props
 * @param {z.infer<typeof ReadReservationLabResponseItem> | undefined} param0.reservation Reservation to display
 * @author Justin Ryan Uy
 */
export default function Reservation({
  children,
  reservation,
  ...props
}: Parameters<typeof Drawer>[0] & {
  reservation?: z.infer<typeof ReadReservationLabResponseItem>;
}) {
  const queryClient = useQueryClient();

  const labQuery = useReadLab(
    ReadLabParams.safeParse({ id: reservation?.labId }).data?.id ?? "",
    { query: { enabled: !!reservation } },
  );

  const lab = getLab(labQuery);

  const { data, isSuccess } = useReadReservationLab(
    ReadReservationLabParams.safeParse(lab).data?.id ?? "",
    { query: { enabled: labQuery.isSuccess && labQuery.data.status === 200 } },
  );

  let reservations: z.infer<typeof ReadReservationLabResponse> | undefined;

  if (isSuccess)
    switch (data.status) {
      case 200:
        try {
          reservations = ReadReservationLabResponse.parse(data.data).filter(
            ({ id }) => id !== reservation?.id,
          );
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(data.data.message);
        break;

      case 500:
        toast.warning(data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  const { mutate: mutateUpdateReservation } = useUpdateReservation({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Updated reservation.");
            break;

          case 400:
          case 401:
          case 404:
            toast.error(data.data.message);
            break;

          case 500:
            toast.warning(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }

        queryClient.invalidateQueries();
      },
    },
  });

  const { mutate: mutateDeleteReservation } = useDeleteReservation({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Deleted reservation.");
            break;

          case 400:
          case 401:
          case 404:
            toast.error(data.data.message);
            break;

          case 500:
            toast.warning(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }

        queryClient.invalidateQueries();
      },
    },
  });

  const now = new Date();

  const [formSchedule, setFormSchedule] = useState<Interval>(
    reservation
      ? {
          start: new Date(reservation.schedule.start),
          end: new Date(reservation.schedule.end),
        }
      : { start: new Date(now), end: new Date(now) },
  );

  const [selected, setSelected] = useState(reservation?.slotIds ?? []);
  const [anonymous, setAnonymous] = useState(reservation?.anonymous ?? false);

  if (!reservation) return children;

  const rawSchedule =
    lab &&
    lab.weeklySchedule[
      (
        [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as (keyof typeof lab.weeklySchedule)[]
      )[startOfDay(reservation.schedule.start).getDay()]
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

  if (isSuccess && lab && reservations)
    return (
      <Drawer {...props}>
        {children}
        <DrawerContent>
          <div className="mx-auto w-full">
            <DrawerHeader>
              <DrawerTitle>Edit Reservation</DrawerTitle>
              <DrawerDescription>
                <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
              </DrawerDescription>
            </DrawerHeader>
            <Form
              action={() => {
                try {
                  mutateUpdateReservation({
                    ...UpdateReservationParams.parse(reservation),
                    data: UpdateReservationBody.parse({
                      schedule: {
                        start: new Date(formSchedule.start).toISOString(),
                        end: new Date(formSchedule.end).toISOString(),
                      },
                      slotIds: selected,
                      anonymous,
                    } as z.infer<typeof UpdateReservationBody>),
                  });
                } catch {
                  toast.error("Invalid fields.");
                }
              }}
            >
              <div className="flex flex-wrap gap-6 p-4 pb-0">
                <Slots className="flex-1" slots={lab.slots}>
                  {({ id }) => {
                    const reservation = reservations
                      .filter(({ schedule }) =>
                        areIntervalsOverlapping(schedule, formSchedule),
                      )
                      .find(({ slotIds }) => slotIds.includes(id));

                    return (
                      <Toggle
                        disabled={!!reservation}
                        className={cn(
                          "h-full w-full",
                          reservation
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                        pressed={selected.includes(id)}
                        onPressedChange={onPressedChange(setSelected, id)}
                        aria-label="Toggle Slot"
                      />
                    );
                  }}
                </Slots>
                <div className="flex w-sm flex-col gap-2">
                  <TimeRangeInput
                    schedule={schedule}
                    value={formSchedule}
                    setValue={setFormSchedule}
                    valid={reservations
                      .filter(({ slotIds }) =>
                        slotIds.some((value) => selected.includes(value)),
                      )
                      .some(({ schedule }) =>
                        areIntervalsOverlapping(schedule, formSchedule),
                      )}
                    submitValue="Reserve"
                  />
                  <Field orientation="horizontal">
                    <Checkbox
                      id="anonymous"
                      checked={anonymous}
                      onCheckedChange={(checked) =>
                        checked !== "indeterminate" && setAnonymous(checked)
                      }
                    />
                    <FieldLabel htmlFor="anonymous">Anonymous</FieldLabel>
                  </Field>
                </div>
              </div>
              <DrawerFooter className="mx-auto max-w-sm">
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
                        This action cannot be undone. This will permanently
                        delete your reservation from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          try {
                            mutateDeleteReservation(
                              DeleteReservationParams.parse(reservation),
                            );
                          } catch {
                            toast.error("Invalid request.");
                          }
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <DrawerClose asChild>
                  <Button variant="outline" type="reset">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    );
}

// eslint-disable-next-line jsdoc/require-returns
/**
 * Reservation display
 * @param {React.ComponentProps<"div">} param0 props
 * @param {z.infer<typeof ReadReservationLabResponseItem> | undefined} param0.reservation Reservation to display
 * @author Justin Ryan Uy
 */
export function ReservationContent({
  className,
  reservation,
  ...props
}: React.ComponentProps<"div"> & {
  reservation: z.infer<typeof ReadReservationLabResponseItem>;
}) {
  const userQuery = useReadUser(
    ReadUserParams.safeParse({ id: reservation.userId }).data?.id ?? "",
    { query: { enabled: !reservation.anonymous } },
  );

  let user: z.infer<typeof ReadUserResponse> | undefined;

  if (userQuery.isSuccess)
    switch (userQuery.data.status) {
      case 200:
        try {
          user = ReadUserResponse.parse(userQuery.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(userQuery.data.data.message);
        break;

      case 500:
        toast.warning(userQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  const labQuery = useReadLab(
    ReadLabParams.safeParse({ id: reservation.labId }).data?.id ?? "",
  );

  let lab: z.infer<typeof ReadLabResponse> | undefined;

  if (labQuery.isSuccess)
    switch (labQuery.data.status) {
      case 200:
        try {
          lab = ReadLabResponse.parse(labQuery.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(labQuery.data.data.message);
        break;

      case 500:
        toast.warning(labQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  return (
    <Card className={cn("w-full max-w-sm", className)} {...props}>
      {(() => {
        if (
          ((userQuery.isSuccess && user) || reservation.anonymous) &&
          labQuery.isSuccess &&
          lab
        )
          return (
            <>
              <CardHeader>
                <CardTitle>
                  {reservation.anonymous
                    ? "Anonymous"
                    : user && (
                        <Link href={`/user/${user.id}`}>
                          {[user.name.first, user.name.last].join(" ")}
                        </Link>
                      )}
                </CardTitle>
                <CardDescription>
                  <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
                </CardDescription>
                {reservation.editable && (
                  <CardAction>
                    <DrawerTrigger asChild>
                      <Button variant="link">Edit</Button>
                    </DrawerTrigger>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                <Slots className="aspect-video" slots={lab.slots}>
                  {({ id }) => (
                    <div
                      className={cn(
                        "h-full",
                        reservation.slotIds.includes(id)
                          ? "bg-primary"
                          : "bg-muted",
                      )}
                    />
                  )}
                </Slots>
              </CardContent>
              <CardFooter>
                {Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).formatRange(
                  toDate(reservation.schedule.start),
                  toDate(reservation.schedule.end),
                )}
              </CardFooter>
            </>
          );
        else if (userQuery.isPending || labQuery.isPending)
          return (
            <CardContent>
              <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
                <Spinner />
                Loading...
              </p>
            </CardContent>
          );
        else
          return (
            <CardContent>
              <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
                Error fetching reservation details.
              </p>
            </CardContent>
          );
      })()}
    </Card>
  );
}

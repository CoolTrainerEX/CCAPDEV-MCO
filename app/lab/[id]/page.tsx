"use client";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Slots from "@/app/slots";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Reservation, {
  onPressedChange,
  ReservationContent,
} from "@/app/reservation";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import Form from "next/form";
import TimeRangeInput from "@/app/time-range-input";
import {
  startOfDay,
  addDays,
  max,
  getHours,
  isAfter,
  Interval,
  areIntervalsOverlapping,
  getMinutes,
  setMinutes,
  setHours,
  roundToNearestMinutes,
  set,
  DateValues,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import {
  ReadLabParams,
  ReadLabResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import { readLabResponse, useReadLab } from "@/src/api/endpoints/lab/lab";
import { toast } from "sonner";
import z from "zod";
import {
  readReservationLabResponse,
  useCreateReservation,
  useReadReservationLab,
} from "@/src/api/endpoints/reservation/reservation";
import {
  CreateReservationBody,
  ReadReservationLabParams,
  ReadReservationLabResponse,
} from "@/src/api/endpoints/reservation/reservation.zod";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { useQueryClient } from "@tanstack/react-query";

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
        toast.error(labQuery.data.data.message);
        break;

      case 404:
        break;

      case 500:
        toast.warning(labQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }
}

/**
 * Parses the reservations from the query.
 * @param {ReturnType<typeof useReadReservationLab>} reservationsQuery Reservations query
 * @returns {z.infer<typeof ReadReservationLabResponse> | undefined} Parsed reservations
 */
function getReservations(
  reservationsQuery: ReturnType<
    typeof useReadReservationLab<readReservationLabResponse>
  >,
) {
  if (reservationsQuery.isSuccess)
    switch (reservationsQuery.data.status) {
      case 200:
        try {
          return ReadReservationLabResponse.parse(reservationsQuery.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
        toast.error(reservationsQuery.data.data.message);
        break;
      case 404:
        break;

      case 500:
        toast.warning(reservationsQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function Lab() {
  const queryClient = useQueryClient();
  const params = ReadLabParams.safeParse(useParams()).data;
  const labQuery = useReadLab(params?.id ?? "");
  const { data, isSuccess, isPending } = labQuery;
  const lab = getLab(labQuery);

  const reservationsQuery = useReadReservationLab(
    ReadReservationLabParams.safeParse(lab).data?.id ?? "",
    {
      query: { enabled: isSuccess && data.status === 200 },
    },
  );

  const reservations = getReservations(reservationsQuery);

  const { mutate } = useCreateReservation({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 201:
            toast.success("Created reservation.");
            break;

          case 400:
          case 401:
          case 404:
          case 409:
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
  const [date, setDate] = useState(now);

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
      )[startOfDay(date).getDay()]
    ];

  let schedule = rawSchedule && {
    start: max([
      setMinutes(
        setHours(new Date(date), getHours(rawSchedule.start)),
        getMinutes(rawSchedule.start),
      ),
      roundToNearestMinutes(now, { nearestTo: 30, roundingMethod: "ceil" }),
    ]),
    end: setMinutes(
      setHours(new Date(date), getHours(rawSchedule.end)),
      getMinutes(rawSchedule.end),
    ),
  };

  if (schedule && isAfter(schedule.start, schedule.end)) schedule = undefined;

  const [selected, setSelected] = useState<string[]>([]);
  const [formSchedule, setFormSchedule] = useState<Interval>({
    start: new Date(schedule?.start ?? date),
    end: new Date(schedule?.end ?? date),
  });

  const [anonymous, setAnonymous] = useState(false);

  if (reservationsQuery.isSuccess && lab)
    return (
      <>
        <div className="container m-auto flex justify-center gap-6">
          <div>
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
              {lab.name}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {lab.id}
            </p>
          </div>
          {lab.editable && (
            <Button variant="outline" asChild>
              <Link href={`/lab/${lab.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
          )}
        </div>
        <Separator className="my-6" />
        <div className="mx-6 flex flex-wrap gap-6">
          <Slots className="max-h-96 min-h-50 flex-1" slots={lab.slots}>
            {({ id }) => {
              const reservation = reservations
                ?.filter((value) =>
                  areIntervalsOverlapping(value.schedule, formSchedule),
                )
                .find(({ slotIds }) => slotIds.includes(id));

              return (
                <Reservation reservation={reservation}>
                  <Tooltip>
                    <Toggle
                      disabled={!!reservation}
                      className={cn(
                        "flex h-full w-full items-center justify-center",
                        !reservation && "bg-muted text-muted-foreground",
                        reservation?.editable &&
                          "bg-primary text-primary-foreground",
                        reservation &&
                          !reservation.editable &&
                          "bg-destructive text-destructive-foreground",
                      )}
                      pressed={selected.includes(id)}
                      onPressedChange={onPressedChange(setSelected, id)}
                      aria-label="Toggle Slot"
                      asChild
                    >
                      <TooltipTrigger asChild>
                        <p className="scroll-m-20 text-xl font-semibold tracking-tight">
                          {id}
                        </p>
                      </TooltipTrigger>
                    </Toggle>
                    {reservation && (
                      <TooltipContent className="bg-transparent p-0">
                        <ReservationContent reservation={reservation} />
                      </TooltipContent>
                    )}
                  </Tooltip>
                </Reservation>
              );
            }}
          </Slots>
          <Card className="mx-auto w-fit">
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                disabled={{
                  before: startOfDay(now),
                  after: addDays(startOfDay(now), 7),
                }}
                required
              />
            </CardContent>
            <CardFooter className="bg-card flex-col gap-6 border-t">
              <Form
                action={() => {
                  if (!selected.length) {
                    toast.error("No selected slots.");
                    return;
                  }

                  try {
                    const dateValue: DateValues = {
                      date: date.getDate(),
                      month: date.getMonth(),
                      year: date.getFullYear(),
                    };

                    mutate({
                      data: CreateReservationBody.parse({
                        labId: lab.id,
                        schedule: {
                          start: set(
                            formSchedule.start,
                            dateValue,
                          ).toISOString(),
                          end: set(formSchedule.end, dateValue).toISOString(),
                        },
                        slotIds: selected,
                        anonymous,
                      } as z.infer<typeof CreateReservationBody>),
                    });

                    setSelected([]);
                  } catch {
                    toast.error("Invalid fields.");
                  }
                }}
                className="flex w-full flex-col gap-2"
              >
                <TimeRangeInput
                  schedule={schedule}
                  value={formSchedule}
                  setValue={setFormSchedule}
                  valid={
                    !reservations
                      ?.filter(({ slotIds }) =>
                        slotIds.some((value) => selected.includes(value)),
                      )
                      .some(({ schedule }) =>
                        areIntervalsOverlapping(schedule, formSchedule),
                      )
                  }
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
              </Form>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  else if (
    isPending ||
    (reservationsQuery.isEnabled && reservationsQuery.isPending)
  ) {
    return (
      <div className="container m-auto flex items-center justify-center gap-6">
        <Spinner className="size-8" />
        <h1 className="scroll-m-20 text-4xl tracking-tight text-balance">
          Loading...
        </h1>
      </div>
    );
  } else notFound();
}

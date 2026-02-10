"use client";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getLab, getReservationsFromLab } from "@/src/sample";
import Slots from "@/app/slots";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { startOfDay } from "date-fns/startOfDay";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { addDays } from "date-fns/addDays";
import { max } from "date-fns/max";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Reservation, {
  onPressedChange,
  ReservationContent,
} from "@/app/reservation";
import useLogin from "@/src/store/login";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import Form from "next/form";
import TimeRangeInput from "@/app/time-range-input";
import { getHours } from "date-fns/getHours";
import { getMinutes } from "date-fns/getMinutes";
import { Interval, isAfter } from "date-fns";
import { areIntervalsOverlapping } from "date-fns/areIntervalsOverlapping";
import { setMinutes } from "date-fns/setMinutes";
import { setHours } from "date-fns/setHours";
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes";

export default function Lab() {
  const { id, name, slots, weeklySchedule } =
    getLab(Number.parseInt(useParams<{ id: string }>().id)) ?? notFound();

  const reservations = getReservationsFromLab(
    id,
    useLogin(({ id }) => id),
  );

  const now = new Date();

  const [date, setDate] = useState(new Date());

  const rawSchedule =
    weeklySchedule[
      (
        [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as (keyof typeof weeklySchedule)[]
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

  const [selected, setSelected] = useState<number[]>([]);
  const [formSchedule, setFormSchedule] = useState<Interval>({
    start: new Date(schedule?.start ?? date),
    end: new Date(schedule?.end ?? date),
  });

  return (
    <>
      <div className="container m-auto">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          {name}
        </h1>
        <p className="text-muted-foreground text-center text-sm">{id}</p>
      </div>
      <Separator className="my-6" />
      <div className="mx-6 flex flex-wrap gap-6">
        <Slots className="max-h-96 min-h-50 flex-1" slots={slots}>
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
            <Form action="/" className="w-full">
              <TimeRangeInput
                schedule={schedule}
                value={formSchedule}
                onValueChange={setFormSchedule}
                valid={
                  !reservations
                    ?.filter(({ slotIds }) =>
                      slotIds.some((value) => selected.includes(value)),
                    )
                    .some(({ schedule }) =>
                      areIntervalsOverlapping(schedule, formSchedule),
                    )
                }
              />
            </Form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

"use client";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator.tsx";
import { getLab, getReservationsFromLab } from "@/src/sample.ts";
import Slots from "@/app/slots.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { useEffect, useState } from "react";
import { startOfDay } from "date-fns/startOfDay";
import { Slider } from "@/components/ui/slider.tsx";
import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { Clock2Icon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import { addDays } from "date-fns/addDays";
import { format } from "date-fns/format";
import { compareDesc } from "date-fns/compareDesc";
import { compareAsc } from "date-fns/compareAsc";
import { max } from "date-fns/max";
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes";

export default function Lab() {
  const { id, name, slots, weeklySched } =
    getLab(Number.parseInt(useParams<{ id: string }>().id)) ??
      notFound();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState([0]);
  const timeDate = new Date(date);

  timeDate.setHours(time[0], time[0] % 1 * 60);

  let schedule = structuredClone(
    weeklySched[
      ([
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ] as (keyof typeof weeklySched)[])[
        startOfDay(date).getDay()
      ]
    ],
  );

  const reserved = getReservationsFromLab(id)?.filter(
    ({ schedule: { start, end } }) =>
      compareDesc(start, timeDate) !== -1 &&
      compareAsc(end, timeDate) !== -1,
  ).flatMap(({ slotIds }) => slotIds);

  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (schedule) {
    const start = new Date(date), end = new Date(date);

    start.setHours(schedule.start.getHours(), schedule.start.getMinutes());
    end.setHours(schedule.end.getHours(), schedule.end.getMinutes());

    schedule.start = max([
      start,
      roundToNearestMinutes(new Date(), {
        nearestTo: 30,
        roundingMethod: "ceil",
      }),
    ]);

    if (differenceInMinutes(schedule.start, end) >= 0) {
      schedule = undefined;
    }
  }

  return (
    <>
      <div className="container m-auto">
        <h1 className="scroll-m-20 text-4xl text-center font-extrabold tracking-tight text-balance">
          {name}
        </h1>
        <p className="text-muted-foreground text-center text-sm">{id}</p>
      </div>
      <Separator className="my-6" />
      <div className="flex gap-6 mx-6">
        <Slots
          className="w-full"
          slots={slots}
        >
          {({ id }) => (
            <div
              className={`w-full h-full flex justify-center items-center ${
                reserved?.includes(id) ? "bg-destructive" : "bg-muted"
              }`}
            >
              <p
                className={`scroll-m-20 text-xl font-semibold tracking-tight ${
                  reserved?.includes(id)
                    ? "text-destructive-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {id}
              </p>
            </div>
          )}
        </Slots>
        <Card className="mx-auto w-fit">
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-0"
              disabled={{
                before: startOfDay(new Date()),
                after: addDays(startOfDay(new Date()), 7),
              }}
              timeZone={timeZone}
              required
            />
          </CardContent>
          <CardFooter className="bg-card border-t">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="time">Time</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="time"
                    type="time"
                    step={30 * 60}
                    disabled={!schedule}
                    min={schedule && format(schedule.start, "HH:mm")}
                    max={schedule && format(schedule.end, "HH:mm")}
                    value={format(timeDate, "HH:mm")}
                    onChange={(event) => {
                      const time = event.target.value.split(":").map((
                        value,
                      ) => Number.parseInt(value));

                      setTime([time[0] + time[1] / 60]);
                    }}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon>
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Slider
                value={time}
                onValueChange={setTime}
                disabled={!schedule}
                min={schedule &&
                  differenceInMinutes(
                      schedule.start,
                      startOfDay(schedule.start),
                    ) / 60}
                max={schedule &&
                  differenceInMinutes(
                      schedule.end,
                      startOfDay(schedule.end),
                    ) /
                    60}
                step={0.5}
              />
            </FieldGroup>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

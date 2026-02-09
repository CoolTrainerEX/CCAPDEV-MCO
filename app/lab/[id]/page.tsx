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
import { Book, BookOpen, Clock2Icon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import { addDays } from "date-fns/addDays";
import { format } from "date-fns/format";
import { max } from "date-fns/max";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import Reservation, {
  onPressedChange,
  ReservationContent,
} from "@/app/reservation.tsx";
import useLogin from "@/src/store/login.ts";
import { cn } from "@/lib/utils.ts";
import { Toggle } from "@/components/ui/toggle.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { Button } from "@/components/ui/button.tsx";
import Form from "next/form";
import TimeRangeInput from "@/app/time-range-input.tsx";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { getHours } from "date-fns/getHours";
import { getMinutes } from "date-fns/getMinutes";
import { Interval, isAfter } from "date-fns";
import { areIntervalsOverlapping } from "date-fns/areIntervalsOverlapping";
import { setMinutes } from "date-fns/setMinutes";
import { setHours } from "date-fns/setHours";
import { parse } from "date-fns/parse";
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes";

export default function Lab() {
  const { id, name, slots, weeklySchedule: weeklySched } =
    getLab(Number.parseInt(useParams<{ id: string }>().id)) ??
      notFound();

  const reservations = getReservationsFromLab(id, useLogin(({ id }) => id));

  const now = new Date();

  const [date, setDate] = useState(new Date());

  const rawSchedule = weeklySched[
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

  const [time, setTime] = useState(new Date(schedule?.start ?? date));

  const reservedSelected = reservations?.filter(
    ({ schedule }) => isWithinInterval(time, schedule),
  );

  const [selected, setSelected] = useState<number[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formSchedule, setFormSchedule] = useState<Interval>({
    start: new Date(schedule?.start ?? date),
    end: new Date(schedule?.end ?? date),
  });
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <>
      <div className="container m-auto">
        <h1 className="scroll-m-20 text-4xl text-center font-extrabold tracking-tight text-balance">
          {name}
        </h1>
        <p className="text-muted-foreground text-center text-sm">{id}</p>
      </div>
      <Separator className="my-6" />
      <div className="flex gap-6 mx-6 flex-wrap">
        <Slots
          className="flex-1 min-h-50 max-h-96"
          slots={slots}
        >
          {({ id }) => {
            const reservation = reservedSelected?.find(({ slotIds }) =>
              slotIds.includes(id)
            );

            return (
              <Reservation reservation={reservation}>
                <Tooltip>
                  <Toggle
                    disabled={!!reservation || !formOpen}
                    className={cn(
                      "w-full h-full flex justify-center items-center",
                      !reservation && "bg-muted text-muted-foreground",
                      reservation?.editable &&
                        "bg-primary text-primary-foreground",
                      reservation && !reservation.editable &&
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
                  {reservation &&
                    (
                      <TooltipContent className="p-0 bg-transparent">
                        <ReservationContent
                          reservation={reservation}
                        />
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
              timeZone={timeZone}
              required
            />
          </CardContent>
          <CardFooter className="bg-card border-t flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="time">
                  {schedule ? "Time" : "Closed"}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="time"
                    type="time"
                    step={30 * 60}
                    disabled={!schedule}
                    min={schedule && format(schedule.start, "HH:mm")}
                    max={schedule && format(schedule.end, "HH:mm")}
                    value={format(time, "HH:mm")}
                    onChange={(event) =>
                      schedule &&
                      setTime(parse(
                        event.target.value,
                        "HH:mm",
                        schedule.start,
                      ))}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon>
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Slider
                value={[time.getHours() + time.getMinutes() / 60]}
                onValueChange={(value) =>
                  schedule && setTime(setMinutes(
                    setHours(new Date(schedule?.start), value[0]),
                    value[0] % 1 * 60,
                  ))}
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
            <Form action="/lab" className="w-full">
              <Collapsible
                open={formOpen}
                onOpenChange={(open) => {
                  setFormOpen(open);
                  setSelected([]);
                }}
                className="flex items-start gap-2 w-full"
              >
                <CollapsibleContent className="col-span-full grid grid-cols-subgrid gap-2 w-full">
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
                </CollapsibleContent>
                <Tooltip>
                  <CollapsibleTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button variant="outline" type="reset" size="icon">
                        {formOpen ? <Book /> : <BookOpen />}
                      </Button>
                    </TooltipTrigger>
                  </CollapsibleTrigger>
                  <TooltipContent>Reserve</TooltipContent>
                </Tooltip>
              </Collapsible>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

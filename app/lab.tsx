"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import TimeRangeInput from "./time-range-input";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import z from "zod";
import {
  CreateLabBody,
  ReadLabResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import { parse, startOfDay } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultSchedule = {
  start: startOfDay(new Date(0)),
  end: parse("23:30", "HH:mm", new Date(0)),
};

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as (keyof z.infer<typeof ReadLabResponse>["weeklySchedule"])[];

import Slots from "./slots";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// eslint-disable-next-line jsdoc/require-jsdoc
export default function LabForm({
  lab,
  submitValue,
  action,
  className,
  ...props
}: Omit<Parameters<typeof Form>[0], "action"> & {
  lab?: z.infer<typeof ReadLabResponse>;
  submitValue: string;
  action: (data: z.infer<typeof CreateLabBody>) => void;
}) {
  const size = lab?.slots
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ id, ...value }) => value)
    .reduce(
      (previousValue, currentValue) => ({
        x: Math.max(previousValue.x, currentValue.x),
        y: Math.max(previousValue.y, currentValue.y),
      }),
      { x: 0, y: 0 },
    );

  const [length, setLength] = useState((size?.x ?? 0) + 1),
    [width, setWidth] = useState((size?.y ?? 0) + 1);
  const [slots, setSlots] = useState<NonNullable<typeof lab>["slots"]>(
    lab?.slots ?? [],
  );

  const [day, setDay] = useState<(typeof days)[number]>("monday");
  const [weeklySchedule, setWeeklySchedule] = useState<
    NonNullable<typeof lab>["weeklySchedule"]
  >(lab?.weeklySchedule ?? {});

  const [open, setOpen] = useState(
    (lab &&
      Object.fromEntries(
        Object.entries(lab.weeklySchedule).map(([key, value]) => [
          key,
          !!value,
        ]),
      )) ??
      Object.fromEntries(days.map((value) => [value, false])),
  );

  return (
    <Form
      action={(formData) => {
        if (!Object.entries(weeklySchedule).length) {
          toast.error("Must have at least one schedule.");
          return;
        }
        if (!slots.length) {
          toast.error("Must have at least one slot.");
          return;
        }

        const slotIds = new Set(slots.map(({ id }) => id));

        if (slotIds.size !== slots.length) {
          toast.error("Duplicate slot IDs not allowed.");
          return;
        }

        if (slotIds.has("")) {
          toast.error("Empty slot ID not allowed.");
          return;
        }

        try {
          action(
            CreateLabBody.parse({
              ...Object.fromEntries(formData.entries()),
              weeklySchedule: Object.fromEntries(
                Object.entries(weeklySchedule).map(([key, value]) => [
                  key,
                  {
                    start: new Date(value.start).toISOString(),
                    end: new Date(value.end).toISOString(),
                  },
                ]),
              ),
              slots,
            }),
          );
        } catch {
          toast.error("Invalid fields.");
        }
      }}
      className={cn("mx-6 flex flex-wrap gap-6", className)}
      {...props}
    >
      <Slots
        className="max-h-96 min-h-50 flex-1"
        slots={Array.from({ length: length * width }, (_, k) => ({
          id: (k + 1).toLocaleString(),
          x: k % length,
          y: Math.floor(k / length),
        }))}
      >
        {(slot) => {
          const selectedSlot = slots.find(
            ({ x, y }) => x === slot.x && y === slot.y,
          );

          /**
           * Filters the slots list with the current slot.
           * @param {NonNullable<typeof lab>["slots"]} slots Slots list
           * @returns {typeof slots} Filtered slots list
           */
          function filterSlot(slots: NonNullable<typeof lab>["slots"]) {
            return slots.filter(({ x, y }) => x !== slot.x || y !== slot.y);
          }

          return (
            <Tooltip>
              <Toggle
                className="bg-muted flex h-full w-full items-center justify-center"
                pressed={!!selectedSlot}
                onPressedChange={(pressed) =>
                  pressed
                    ? setSlots((slots) => [slot, ...slots])
                    : setSlots(filterSlot)
                }
                aria-label="Toggle Slot"
                asChild
              >
                {selectedSlot ? (
                  <TooltipTrigger asChild>
                    <p className="scroll-m-20 text-xl font-semibold tracking-tight">
                      {selectedSlot.id}
                    </p>
                  </TooltipTrigger>
                ) : (
                  <span />
                )}
              </Toggle>
              {selectedSlot && (
                <TooltipContent>
                  <Field>
                    <FieldLabel htmlFor="id">ID</FieldLabel>
                    <Input
                      id="id"
                      placeholder="1"
                      required
                      value={selectedSlot.id}
                      onChange={(event) =>
                        setSlots((slots) => [
                          {
                            id: event.target.value,
                            x: selectedSlot.x,
                            y: selectedSlot.y,
                          },
                          ...filterSlot(slots),
                        ])
                      }
                    />
                  </Field>
                </TooltipContent>
              )}
            </Tooltip>
          );
        }}
      </Slots>
      <Card className="mx-auto w-xs">
        <CardHeader>
          <Tabs
            value={day}
            onValueChange={(value) => setDay(value as typeof day)}
          >
            <TabsList className="w-full">
              {days.map((value) => (
                <TabsTrigger value={value} key={value}>
                  {value[0].toLocaleUpperCase() + value.slice(1, 2)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Field orientation="horizontal">
            <Checkbox
              id="open"
              checked={open[day]}
              onCheckedChange={(checked) => {
                if (checked === "indeterminate") return;

                setOpen((open) => ({ ...open, [day]: checked }));

                if (checked)
                  setWeeklySchedule((weeklySchedule) => ({
                    ...weeklySchedule,
                    [day]: defaultSchedule,
                  }));
                else
                  setWeeklySchedule((weeklySchedule) => ({
                    ...weeklySchedule,
                    [day]: undefined,
                  }));
              }}
            />
            <FieldLabel htmlFor="open">Open</FieldLabel>
          </Field>
          <TimeRangeInput
            schedule={defaultSchedule}
            valid={true}
            value={weeklySchedule[day] ?? defaultSchedule}
            setValue={(value) => {
              setWeeklySchedule((weeklySchedule) => ({
                ...weeklySchedule,
                [day]: value,
              }));

              setOpen((open) => ({ ...open, [day]: true }));
            }}
            submitValue={submitValue}
          />
        </CardContent>
        <CardFooter className="bg-card border-t">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Lab"
                defaultValue={lab?.name}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="length">Length</FieldLabel>
              <Input
                id="length"
                type="number"
                placeholder="1"
                min={1}
                required
                value={length}
                onChange={(event) => {
                  setLength(event.target.valueAsNumber);
                  setSlots([]);
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="width">Width</FieldLabel>
              <Input
                id="width"
                type="number"
                placeholder="1"
                min={1}
                required
                value={width}
                onChange={(event) => {
                  setWidth(event.target.valueAsNumber);
                  setSlots([]);
                }}
              />
            </Field>
          </FieldGroup>
        </CardFooter>
      </Card>
    </Form>
  );
}

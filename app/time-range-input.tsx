import { differenceInMinutes } from "date-fns";
import { startOfDay } from "date-fns";
import { Clock2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import React, { Dispatch, SetStateAction } from "react";
import { Interval } from "date-fns";
import { parse } from "date-fns";
import { getHours } from "date-fns";
import { setMinutes } from "date-fns";
import { getMinutes } from "date-fns";
import { setHours } from "date-fns";
import { cn } from "@/lib/utils";

// eslint-disable-next-line jsdoc/require-returns
/**
 * Time Range form field.
 * @param {React.ComponentProps<"div">} param0 props
 * @param {Interval | undefined} param0.schedule Available schedule
 * @param {boolean | undefined} param0.valid Toggle validity style
 * @param {Interval} param0.value Value state
 * @param {Dispatch<SetStateAction<Interval>>} param0.setValue Value state set
 * @author Justin Ryan Uy
 */
export default function TimeRangeInput({
  schedule,
  valid,
  value,
  setValue,
  ...props
}: React.ComponentProps<"div"> & {
  schedule?: Interval;
  valid?: boolean;
  value: Interval;
  setValue: Dispatch<SetStateAction<Interval>>;
}) {
  return (
    <FieldGroup {...props}>
      <Field>
        <FieldLabel htmlFor="start">Start</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="start"
            name="start"
            type="time"
            step={30 * 60}
            disabled={!schedule}
            min={schedule && format(schedule.start, "HH:mm")}
            max={schedule && format(schedule.end, "HH:mm")}
            value={format(value.start, "HH:mm")}
            onChange={(event) =>
              schedule &&
              setValue((value) => ({
                ...value,
                start: parse(event.target.value, "HH:mm", schedule.start),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2 className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="end">End</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="end"
            name="end"
            type="time"
            step={30 * 60}
            disabled={!schedule}
            min={schedule && format(schedule.start, "HH:mm")}
            max={schedule && format(schedule.end, "HH:mm")}
            value={format(value.end, "HH:mm")}
            onChange={(event) =>
              schedule &&
              setValue((value) => ({
                ...value,
                end: parse(event.target.value, "HH:mm", schedule.end),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2 className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Slider
        value={[
          getHours(value.start) + getMinutes(value.start) / 60,
          getHours(value.end) + getMinutes(value.end) / 60,
        ]}
        onValueChange={(value) =>
          schedule &&
          setValue({
            start: setMinutes(
              setHours(new Date(schedule.start), value[0]),
              (value[0] % 1) * 60,
            ),
            end: setMinutes(
              setHours(new Date(schedule.end), value[1]),
              (value[1] % 1) * 60,
            ),
          })
        }
        disabled={!schedule}
        min={
          schedule &&
          differenceInMinutes(schedule.start, startOfDay(schedule.start)) / 60
        }
        max={
          schedule &&
          differenceInMinutes(schedule.end, startOfDay(schedule.end)) / 60
        }
        step={0.5}
        className={cn(!valid && "**:data-[slot=slider-range]:bg-destructive")}
      />
      <Button type="submit" disabled={!schedule || !valid}>
        Reserve
      </Button>
    </FieldGroup>
  );
}

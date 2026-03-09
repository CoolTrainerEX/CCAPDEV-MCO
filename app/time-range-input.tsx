import { Clock2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import React, { Dispatch, SetStateAction } from "react";
import {
  startOfDay,
  differenceInMinutes,
  setHours,
  Interval,
  format,
  parse,
  getHours,
  getMinutes,
  setMinutes,
} from "date-fns";
import { cn } from "@/lib/utils";

// eslint-disable-next-line jsdoc/require-returns
/**
 * Time Range form field.
 * @param {React.ComponentProps<"div">} param0 props
 * @param {Interval | undefined} param0.schedule Available schedule
 * @param {boolean | undefined} param0.valid Toggle validity style
 * @param {Interval} param0.value Value state
 * @param {Dispatch<SetStateAction<Interval>>} param0.setValue Value state set
 * @param {string} param0.submitValue Submit button text
 * @author Justin Ryan Uy
 */
export default function TimeRangeInput({
  schedule,
  valid,
  value,
  setValue,
  submitValue,
  ...props
}: React.ComponentProps<"div"> & {
  schedule?: Interval;
  valid?: boolean;
  value: Interval;
  setValue: Dispatch<SetStateAction<Interval>>;
  submitValue: string;
}) {
  return (
    <FieldGroup {...props}>
      <Field data-invalid={!valid}>
        <FieldLabel htmlFor="start">Start</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="start"
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
                start: parse(event.target.value, "HH:mm", value.start),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            aria-invalid={!valid}
          />
          <InputGroupAddon>
            <Clock2 className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field data-invalid={!valid}>
        <FieldLabel htmlFor="end">End</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="end"
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
                end: parse(event.target.value, "HH:mm", value.end),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            aria-invalid={!valid}
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
        {submitValue}
      </Button>
    </FieldGroup>
  );
}

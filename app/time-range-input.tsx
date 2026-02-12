import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { startOfDay } from "date-fns/startOfDay";
import { Clock2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns/format";
import { Dispatch, SetStateAction } from "react";
import { Interval } from "date-fns";
import { parse } from "date-fns/parse";
import { getHours } from "date-fns/getHours";
import { setMinutes } from "date-fns/setMinutes";
import { getMinutes } from "date-fns/getMinutes";
import { setHours } from "date-fns/setHours";
import { cn } from "@/lib/utils";

export default function TimeRangeInput({
  schedule,
  valid,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  schedule?: Interval;
  valid?: boolean;
  value: Interval;
  onValueChange: Dispatch<SetStateAction<Interval>>;
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
              onValueChange((value) => ({
                ...value,
                start: parse(event.target.value, "HH:mm", schedule.start),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2Icon className="text-muted-foreground" />
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
              onValueChange((value) => ({
                ...value,
                end: parse(event.target.value, "HH:mm", schedule.end),
              }))
            }
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2Icon className="text-muted-foreground" />
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
          onValueChange({
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

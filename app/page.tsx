"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { getLabs, getReservationsFromLab } from "@/src/sample.ts";
import Slots from "./slots.tsx";
import { Field } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import Form from "next/form";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx";
import { startOfDay } from "date-fns/startOfDay";
import { compareAsc } from "date-fns/compareAsc";
import { compareDesc } from "date-fns/compareDesc";
import { useEffect, useState } from "react";

export default function Home() {
  const labs = getLabs(useSearchParams().get("q") ?? "");
  const [format, setFormat] = useState<Intl.DateTimeFormat | undefined>(
    undefined,
  );

  useEffect(() => {
    setFormat(Intl.DateTimeFormat(undefined, {
      timeStyle: "short",
    }));
  }, []);

  return (
    <>
      <Form action="/" className="w-md mx-auto">
        <Field orientation="horizontal">
          <Input type="search" name="q" placeholder="Search" />
          <Button type="submit">
            <Search />
          </Button>
        </Field>
      </Form>
      <Separator className="my-6" />
      <div className="flex flex-wrap gap-6 justify-around container m-auto">
        {labs.map(
          ({ id, name, weeklySched, slots }) => {
            const reserved = getReservationsFromLab(id)?.filter(
              ({ schedule: { start, end } }) =>
                compareDesc(start, new Date()) !== -1 &&
                compareAsc(end, new Date()) !== -1,
            ).flatMap((
              { slotIds },
            ) => slotIds);

            const schedule = weeklySched[
              ([
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ] as (keyof typeof weeklySched)[])[
                startOfDay(new Date()).getDay()
              ]
            ];

            return (
              <Card key={id} className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  <CardAction>
                    <Button variant="link" asChild>
                      <Link href={`/lab/${id}`}>Reserve</Link>
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Slots
                    className="aspect-video"
                    slots={slots}
                  >
                    {({ id }) => (
                      <div
                        className={`w-full h-full ${
                          reserved?.includes(id) ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </Slots>
                </CardContent>
                <CardFooter>
                  {schedule
                    ? (
                      format?.formatRange(
                        schedule.start,
                        schedule.end,
                      )
                    )
                    : (
                      "Closed today"
                    )}
                </CardFooter>
              </Card>
            );
          },
        )}
      </div>
    </>
  );
}

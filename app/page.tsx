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
import { Plus, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx";
import { startOfDay } from "date-fns/startOfDay";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils.ts";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { toDate } from "date-fns/toDate";
import useLogin from "@/src/store/login.ts";

export default function Home() {
  const admin = useLogin(({ admin }) => admin);
  const labs = getLabs(useSearchParams().get("q") ?? "");
  const [format, setFormat] = useState<Intl.DateTimeFormat | undefined>(
    undefined,
  );

  const now = new Date();

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
          {admin &&
            (
              <Button variant="secondary" asChild>
                <Link href="/lab/create">
                  <Plus />
                </Link>
              </Button>
            )}
        </Field>
      </Form>
      <Separator className="my-6" />
      <div className="flex flex-wrap gap-6 justify-around container m-auto">
        {labs.map(
          ({ id, name, weeklySchedule: weeklySched, slots }) => {
            const reserved = getReservationsFromLab(id)?.filter(
              ({ schedule }) => isWithinInterval(now, schedule),
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
                startOfDay(now).getDay()
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
                        className={cn(
                          "w-full h-full",
                          reserved?.includes(id) ? "bg-primary" : "bg-muted",
                        )}
                      />
                    )}
                  </Slots>
                </CardContent>
                <CardFooter>
                  {schedule
                    ? (
                      format?.formatRange(
                        toDate(schedule.start),
                        toDate(schedule.end),
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

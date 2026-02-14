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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLabs, getReservationsFromLab, getUser } from "@/src/sample";
import Slots from "./slots";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { Plus, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { startOfDay } from "date-fns/startOfDay";
import { cn } from "../lib/utils";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { toDate } from "date-fns/toDate";
import useLogin from "@/src/store/login";

export default function Home() {
  const admin = getUser(useLogin(({ id }) => id))?.admin;
  const labs = getLabs(useSearchParams().get("q") || undefined);
  const now = new Date();

  return (
    <>
      <Form action="/" className="mx-auto w-md max-w-full">
        <Field orientation="horizontal">
          <Input type="search" name="q" placeholder="Search" />
          <Button type="submit">
            <Search />
          </Button>
          {admin && (
            <Button variant="secondary" asChild>
              <Link href="/lab/create">
                <Plus />
              </Link>
            </Button>
          )}
        </Field>
      </Form>
      <Separator className="my-6" />
      <div className="container m-auto flex flex-wrap justify-around gap-6">
        {labs.length ? (
          labs.map(({ id, name, weeklySchedule: weeklySched, slots }) => {
            const reserved = getReservationsFromLab(id)
              ?.filter(({ schedule }) => isWithinInterval(now, schedule))
              .flatMap(({ slotIds }) => slotIds);

            const schedule =
              weeklySched[
                (
                  [
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                  ] as (keyof typeof weeklySched)[]
                )[startOfDay(now).getDay()]
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
                  <Slots className="aspect-video" slots={slots}>
                    {({ id }) => (
                      <div
                        className={cn(
                          "h-full w-full",
                          reserved?.includes(id) ? "bg-primary" : "bg-muted",
                        )}
                      />
                    )}
                  </Slots>
                </CardContent>
                <CardFooter>
                  {schedule
                    ? Intl.DateTimeFormat(undefined, {
                        timeStyle: "short",
                      })?.formatRange(
                        toDate(schedule.start),
                        toDate(schedule.end),
                      )
                    : "Closed today"}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <p className="text-center leading-7 not-first:mt-6">No labs.</p>
        )}
      </div>
    </>
  );
}

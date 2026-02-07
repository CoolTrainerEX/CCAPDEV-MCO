"use client";
import Link from "next/link";
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
import useLogin from "@/src/store/login.ts";

export default function Home() {
  const loginId = useLogin().id;

  return (
    <div className="flex flex-wrap gap-6 justify-around">
      {getLabs().map((value) => {
        const reserved = getReservationsFromLab(value.id, loginId)?.filter(
          (value) =>
            value.schedule.start.getTime() <= Date.now() &&
            value.schedule.end.getTime() >= Date.now(),
        ).flatMap((
          value,
        ) => value.slotIds);

        console.log(reserved)

        const schedule = value.weeklySched[
          ([
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ] as (keyof typeof value.weeklySched)[])[
            new Date().getDay()
          ]
        ];

        return (
          <Card key={value.id} className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{value.name}</CardTitle>
              <CardAction>
                <Button variant="link" asChild>
                  <Link href={`/lab/${value.id}`}>Reserve</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Slots
                className="aspect-video"
                slots={value.slots.map((value) => ({
                  ...value,
                  reserved: reserved?.includes(value.id) || undefined,
                }))}
              >
                {(slot) => (
                  <div
                    className={`h-full ${
                      slot.reserved ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </Slots>
            </CardContent>
            <CardFooter>
              {schedule
                ? (
                  Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                  }).formatRange(
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
      })}
    </div>
  );
}

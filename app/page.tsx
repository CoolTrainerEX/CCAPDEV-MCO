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
import { Field } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import Form from "next/form";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx";
import { startOfDay } from "date-fns/startOfDay";
import { compareAsc } from "date-fns/compareAsc";
import { compareDesc } from "date-fns/compareDesc";

export default async function Home(
  { searchParams }: Readonly<
    { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
  >,
) {
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
        {getLabs([(await searchParams)["q"]].flat()[0] ?? "").map(
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
                    slots={slots.map((value) => ({
                      ...value,
                      reserved: reserved?.includes(value.id) || undefined,
                    }))}
                  >
                    {({ reserved }) => (
                      <div
                        className={`w-full h-full ${
                          reserved ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </Slots>
                </CardContent>
                <CardFooter>
                  {schedule
                    ? (
                      Intl.DateTimeFormat(undefined, {
                        timeStyle: "short",
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
          },
        )}
      </div>
    </>
  );
}

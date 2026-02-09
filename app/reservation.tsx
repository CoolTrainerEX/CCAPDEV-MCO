import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getLab, getReservationsFromLab, getUser } from "@/src/sample.ts";
import Slots from "./slots.tsx";
import { cn } from "@/lib/utils.ts";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer.tsx";
import Form from "next/form";

export function ReservationContent(
  { className, reservation, ...props }: React.ComponentProps<"div"> & {
    reservation: NonNullable<
      ReturnType<typeof getReservationsFromLab>
    >[number];
  },
) {
  const user = reservation.anonymous
    ? { name: { first: "Anonymous", last: "" } }
    : getUser(reservation.userId);

  const lab = getLab(reservation.labId);

  if (!user) throw new Error(`Invalid user ID ${reservation.userId}.`);
  if (!lab) throw new Error(`Invalid Lab ID ${reservation.labId}`);

  const [format, setFormat] = useState<Intl.DateTimeFormat | undefined>(
    undefined,
  );

  useEffect(() => {
    setFormat(Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }));
  }, []);

  return (
    <Card className={cn("w-full max-w-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>
          <Link href={`/user/${reservation.userId}`}>
            {[user.name.first, user.name.last].join(
              " ",
            )}
          </Link>
        </CardTitle>
        <CardDescription>
          <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
        </CardDescription>
        {reservation.editable &&
          (
            <CardAction>
              <DrawerTrigger asChild>
                <Button variant="link">Edit</Button>
              </DrawerTrigger>
            </CardAction>
          )}
      </CardHeader>
      <CardContent>
        <Slots
          className="aspect-video"
          slots={lab.slots}
        >
          {({ id }) => (
            <div
              className={cn(
                "h-full",
                reservation.slotIds.includes(id) ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </Slots>
      </CardContent>
      <CardFooter>
        {format?.formatRange(
          reservation.schedule.start,
          reservation.schedule.end,
        )}
      </CardFooter>
    </Card>
  );
}

export default function Reservation(
  { children, reservation, ...props }: Parameters<typeof Drawer>[0] & {
    reservation?: NonNullable<
      ReturnType<typeof getReservationsFromLab>
    >[number];
  },
) {
  if (!reservation) return <>{children}</>;

  const lab = getLab(reservation.labId);

  if (!lab) throw new Error(`Invalid Lab ID ${reservation.labId}`);

  return (
    <Drawer {...props}>
      {children}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit Reservation</DrawerTitle>
            <DrawerDescription>
              <Link href={`/lab/${lab.id}`}>{lab.name}</Link>
            </DrawerDescription>
          </DrawerHeader>
          <Form action="/" formMethod="post">
            <div className="p-4 pb-0">
            </div>
            <DrawerFooter>
              <Button type="submit">Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline" type="reset">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

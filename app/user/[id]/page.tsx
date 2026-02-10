"use client";
import { notFound, useParams } from "next/navigation";
import { getReservationsFromUser, getUser } from "@/src/sample";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Reservation, { ReservationContent } from "@/app/reservation";
import useLogin from "@/src/store/login";

export default function User() {
  const loginId = useLogin(({ id }) => id);
  const { id, name, admin } =
    getUser(Number.parseInt(useParams<{ id: string }>().id)) ?? notFound();

  const reservations = getReservationsFromUser(id, loginId);

  return (
    <>
      <div className="container m-auto flex items-center justify-center gap-6">
        <Avatar size="lg">
          <AvatarImage src="" />
          <AvatarFallback>{name.first[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-baseline justify-center gap-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              {name.first} {name.last}
            </h1>
            {admin && <Badge>Admin</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">{id}</p>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="flex justify-around gap-6">
        {reservations?.length ? (
          reservations.map((value) => (
            <Reservation key={value.id} reservation={value}>
              <ReservationContent reservation={value} />
            </Reservation>
          ))
        ) : (
          <p className="text-center leading-7 not-first:mt-6">
            No reservations.
          </p>
        )}
      </div>
    </>
  );
}

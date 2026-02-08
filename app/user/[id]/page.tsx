"use client";
import { notFound, useParams } from "next/navigation";
import { getReservationsFromUser, getUser } from "@/src/sample.ts";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import Reservations from "@/app/reservations.tsx";
import useLogin from "../../../src/store/login.ts";

export default function User() {
  const { id: loginId } = useLogin();
  const { id, name, admin } =
    getUser(Number.parseInt(useParams<{ id: string }>().id)) ??
      notFound();

  return (
    <>
      <div className="flex justify-center items-center gap-6 container m-auto">
        <Avatar size="lg">
          <AvatarImage src="" />
          <AvatarFallback>
            {name.first[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex justify-center items-baseline gap-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              {name.first} {name.last}
            </h1>
            {admin && <Badge>Admin</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">{id}</p>
        </div>
      </div>
      <Separator className="my-6" />
      <Reservations reservations={getReservationsFromUser(id, loginId)} />
    </>
  );
}

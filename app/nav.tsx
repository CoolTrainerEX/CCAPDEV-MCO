"use client";
import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import icon from "./icon.svg";
import { useReadCurrentUser, useReadUser } from "@/src/api/endpoints/user/user";
import {
  ReadCurrentUserResponse,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import { toast } from "sonner";
import z from "zod";

export default function Nav() {
  const { data: currentUserData } = useReadCurrentUser();

  let currentUserId = Number.NaN;

  try {
    if (currentUserData?.status === 200)
      currentUserId = ReadCurrentUserResponse.parse(currentUserData.data);
  } catch {
    toast.warning("Bad Response.");
  }

  const { data, isEnabled } = useReadUser(currentUserId, {
    query: { enabled: currentUserData?.status === 200 },
  });

  let user: z.infer<typeof ReadUserResponse> | undefined;

  try {
    if (isEnabled && data?.status === 200)
      user = ReadUserResponse.parse(data.data);
  } catch {
    toast.warning("Bad response.");
  }

  return (
    <NavigationMenu className="bg-card text-card-foreground sticky top-0 max-w-full p-4 [&>div]:w-full">
      <NavigationMenuList className="justify-between">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className="flex-row gap-6">
              <div className="relative hidden w-10 sm:block">
                <Image src={icon} alt="ArchersLab logo" fill />
              </div>
              <h1 className="scroll-m-20 font-sans text-4xl font-extrabold tracking-tight text-balance">
                ArchersLab
              </h1>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            {user ? (
              <Link
                href={`/user/${user.id}`}
                className="flex-row gap-4 align-middle"
              >
                <p className="hidden leading-7 not-first:mt-6 sm:block">
                  Hello, {user.name!.first}!
                </p>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{user.name!.first[0]}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-primary-foreground"
              >
                Login
              </Link>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

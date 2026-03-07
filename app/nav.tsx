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
import icon from "./icon0.svg";
import { useReadCurrentUser, useReadUser } from "@/src/api/endpoints/user/user";
import {
  ReadCurrentUserResponse,
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import { toast } from "sonner";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";

// eslint-disable-next-line jsdoc/require-jsdoc
export default function Nav() {
  const currentUserQuery = useReadCurrentUser();

  let currentUser = Number.NaN;

  if (currentUserQuery.isSuccess)
    switch (currentUserQuery.data.status) {
      case 200:
        try {
          currentUser = ReadCurrentUserResponse.parse(
            currentUserQuery.data.data,
          );
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 401:
        break;
      case 404:
        toast.error(currentUserQuery.data.data.message);
        break;

      case 500:
        toast.warning(currentUserQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  const { data, isPending, isSuccess, isEnabled } = useReadUser(
    ReadUserParams.safeParse({ id: currentUser }).data?.id ?? Number.NaN,
    {
      query: {
        enabled:
          currentUserQuery.isSuccess && currentUserQuery.data.status === 200,
      },
    },
  );

  let user: z.infer<typeof ReadUserResponse> | undefined;

  if (isSuccess)
    switch (data.status) {
      case 200:
        try {
          user = ReadUserResponse.parse(data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(data.data.message);
        break;

      case 500:
        toast.warning(data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  return (
    <NavigationMenu className="bg-card text-card-foreground sticky top-0 z-50 max-w-full p-4 [&>div]:w-full">
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
            {(() => {
              if (isSuccess && user)
                return (
                  <Link
                    href={`/user/${user.id}`}
                    className="flex-row gap-4 align-middle"
                  >
                    <p className="hidden leading-7 not-first:mt-6 sm:block">
                      Hello, {user.name.first}!
                    </p>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{user.name.first[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                );
              else if (isPending && isEnabled)
                return (
                  <div className="container">
                    <Spinner />
                  </div>
                );
              else
                return (
                  <Link
                    href="/login"
                    className="bg-primary text-primary-foreground"
                  >
                    Login
                  </Link>
                );
            })()}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { getUser } from "@/src/sample.ts";
import useLogin from "@/src/store/login.ts";

export default function Nav() {
  const user = getUser(useLogin(({ id }) => id));

  return (
    <NavigationMenu className="sticky top-0 p-4 max-w-full [&>div]:w-full bg-card text-card-foreground">
      <NavigationMenuList className="justify-between">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className="flex-row gap-6">
              <div className="relative w-10 hidden sm:block">
                <Image
                  src="/icon.svg"
                  alt="ArchersLab logo"
                  fill
                />
              </div>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance font-sans">
                ArchersLab
              </h1>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            {user
              ? (
                <Link
                  href={`/user/${user.id}`}
                  className="flex-row gap-4 align-middle"
                >
                  <p className="leading-7 not-first:mt-6 hidden sm:block">
                    Hello, {user.name.first} {user.name.last}!
                  </p>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user.name.first[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )
              : (
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

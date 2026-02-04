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
import { useLogin } from "@/src/api/endpoints/default/default.ts";

export default function Nav() {
  const { data, isLoading } = useLogin({
    email: "juan_dela_cruz@dlsu.edu.ph",
    password: "password",
  });

  return (
    <NavigationMenu className="sticky top-0 p-4 max-w-full [&>div]:w-full bg-secondary text-secondary-foreground">
      <NavigationMenuList className="justify-between">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className="flex-row gap-4">
              <div className="relative w-10">
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
            {isLoading ? <>Loading</> : (
              <Link
                href={`/user/${data?.data?.id}`}
                className="flex-row gap-4"
              >
                <p className="leading-7 not-first:mt-6">
                  Hello, {data?.data?.name.first} {data?.data?.name.last}!
                </p>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {data?.data?.name.first[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

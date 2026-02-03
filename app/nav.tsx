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
import { useUser } from "../store/useUser.ts";

export default function Nav() {
  const userID = useUser((state) => state.userID);

  return (
    <NavigationMenu className="sticky p-4 max-w-full [&>div]:w-full">
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
            <Link href={`/user/${userID}`} className="flex-row gap-4">
              <p className="leading-7 not-first:mt-6">
                Hello, {useUser((state) => state.username)}!
              </p>
              <Avatar>
                <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg" />
                <AvatarFallback>
                  {userID.toString()[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

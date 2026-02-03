import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Button } from "@/components/ui/button.tsx";
import { HomeIcon, UserXIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserXIcon />
        </EmptyMedia>
        <EmptyTitle>Invalid User</EmptyTitle>
        <EmptyDescription>User not found</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <Link href="/">
            <HomeIcon /> Return home
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

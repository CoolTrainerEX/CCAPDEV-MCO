import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Home, UserX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserX />
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
            <Home /> Return home
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

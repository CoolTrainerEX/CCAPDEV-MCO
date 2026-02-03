import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/ui/empty.tsx";
import { Button } from "../components/ui/button.tsx";
import { HomeIcon, XIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <XIcon />
        </EmptyMedia>
        <EmptyTitle>404</EmptyTitle>
        <EmptyDescription>Page not found</EmptyDescription>
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

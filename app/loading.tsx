import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// eslint-disable-next-line jsdoc/require-jsdoc
export default function Loading() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading</EmptyTitle>
        <EmptyDescription>Page is loading</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

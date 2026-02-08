import { Spinner } from "@/components/ui/spinner.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
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

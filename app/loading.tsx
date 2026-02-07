import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function Loading() {
    return (
        <div className="flex flex-wrap gap-6 justify-around">
            {new Array(3).fill(null).map((value) => (
                <Card key={value} className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="w-1/2 h-4" />
                        </CardTitle>
                        <CardAction>
                            <Skeleton className="w-14 h-4" />
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="aspect-video" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="w-1/2 h-4" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

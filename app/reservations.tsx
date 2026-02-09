import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import { getLab, getReservationsFromLab, getUser } from "@/src/sample.ts";
import Slots from "./slots.tsx";
import { cn } from "@/lib/utils.ts";
import { useEffect, useState } from "react";

export default function Reservations(
    { className, reservations, ...props }: React.ComponentProps<"div"> & {
        reservations: ReturnType<typeof getReservationsFromLab>;
    },
) {
    const [format, setFormat] = useState<Intl.DateTimeFormat | undefined>(
        undefined,
    );

    useEffect(() => {
        setFormat(Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }));
    }, []);

    return (
        <div className={cn("flex gap-6", className)} {...props}>
            {reservations?.map(
                (
                    {
                        id,
                        userId,
                        labId,
                        anonymous,
                        schedule,
                        slotIds,
                        editable,
                    },
                ) => {
                    const user = anonymous
                        ? { name: { first: "Anonymous", last: "" } }
                        : getUser(userId);

                    const lab = getLab(labId);

                    if (!user) throw new Error(`Invalid user ID ${userId}.`);
                    if (!lab) throw new Error(`Invalid Lab ID ${labId}`);

                    return (
                        <Card key={id} className="w-full max-w-sm">
                            <CardHeader>
                                <CardTitle>
                                    <Link href={`/user/${userId}`}>
                                        {[user.name.first, user.name.last].join(
                                            " ",
                                        )}
                                    </Link>
                                </CardTitle>
                                <CardDescription>{lab.name}</CardDescription>
                                {editable &&
                                    (
                                        <CardAction>
                                            <Button variant="link" asChild>
                                                <Link href="">
                                                    Edit
                                                </Link>
                                            </Button>
                                        </CardAction>
                                    )}
                            </CardHeader>
                            <CardContent>
                                <Slots
                                    className="aspect-video"
                                    slots={lab.slots}
                                >
                                    {({ id }) => (
                                        <div
                                            className={`h-full ${
                                                slotIds?.includes(id)
                                                    ? "bg-primary"
                                                    : "bg-muted"
                                            }`}
                                        />
                                    )}
                                </Slots>
                            </CardContent>
                            <CardFooter>
                                {format?.formatRange(
                                    schedule.start,
                                    schedule.end,
                                )}
                            </CardFooter>
                        </Card>
                    );
                },
            )}
        </div>
    );
}

import { cn } from "@/lib/utils.ts";
import { ReactNode } from "react";
import { getLab } from "@/src/sample.ts";

export default function Slots(
    { className, style, children, slots, ...props }:
        & Omit<React.ComponentProps<"div">, "children">
        & {
            children: (slot: typeof slots[number]) => ReactNode;
            slots: (
                & NonNullable<ReturnType<typeof getLab>>["slots"][number]
                & Partial<Record<"reserved", true>>
            )[];
        },
) {
    // deno-lint-ignore no-unused-vars
    const { x, y } = slots.map(({ id, ...value }) => value).reduce(
        (previousValue, currentValue) => ({
            x: Math.max(previousValue.x, currentValue.x),
            y: Math.max(previousValue.y, currentValue.y),
        }),
        { x: 0, y: 0 },
    );
    return (
        <div
            className={cn("grid gap-2", className)}
            style={{
                gridTemplateColumns: `repeat(${x + 1}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${y + 1}, minmax(0, 1fr))`,
                ...style,
            }}
            {...props}
        >
            {slots.map((value) => (
                <span
                    key={value.id}
                    style={{
                        gridColumnStart: value.x + 1,
                        gridRowStart: value.y + 1,
                    }}
                >
                    {children(value)}
                </span>
            ))}
        </div>
    );
}

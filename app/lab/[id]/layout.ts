import { getLab } from "@/src/sample.ts";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
) {
    const name = getLab(Number.parseInt((await params).id))?.name;

    return {
        title: name,
    };
}

export default function LabLayout(
    { children }: { children: React.ReactNode },
) {
    return children;
}

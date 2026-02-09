import { getUser } from "@/src/sample.ts";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
) {
    const name = getUser(Number.parseInt((await params).id))?.name;

    return {
        title: name && `${name.first} ${name.last}`,
    };
}

export default function UserLayout(
    { children }: { children: React.ReactNode },
) {
    return children;
}

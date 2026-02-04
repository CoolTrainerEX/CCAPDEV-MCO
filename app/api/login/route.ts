import { User } from "@/src/api/models/index.zod.ts";

export function GET(request: Request) {
    const res: User = {
        email: "juan_dela_cruz@dlsu.edu.ph",
        password: "password",
        id: 1,
        name: {
            first: "Juan",
            last: "Dela Cruz",
        },
    };

    return Response.json(res);
}

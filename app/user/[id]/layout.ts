import {
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

// eslint-disable-next-line jsdoc/require-jsdoc
export async function generateMetadata(props: LayoutProps<"/user/[id]">) {
  const params = ReadUserParams.safeParse(await props.params).data;
  const userQuery = await fetch(
    `${baseUrl}/api/user/${params?.id ?? Number.NaN}`,
  );

  if (userQuery.ok && userQuery.status === 200) {
    const user = ReadUserResponse.safeParse(await userQuery.json()).data;
    return {
      title: user?.name && `${user.name.first} ${user.name.last}`,
    };
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

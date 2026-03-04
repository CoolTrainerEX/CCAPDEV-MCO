import { ReadUserParams } from "@/src/api/endpoints/user/user.zod";
import { getUser } from "@/src/sample";

// eslint-disable-next-line jsdoc/require-jsdoc
export async function generateMetadata({
  params,
}: {
  params: LayoutProps<"/user/[id]">;
}) {
  const name = getUser(ReadUserParams.parse(params).id)?.name;

  return {
    title: name && `${name.first} ${name.last}`,
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

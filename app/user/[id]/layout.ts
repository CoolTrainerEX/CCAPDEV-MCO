import { getUser, users } from "@/src/sample";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const name = getUser(Number.parseInt((await params).id))?.name;

  return {
    title: name && `${name.first} ${name.last}`,
  };
}

export function generateStaticParams() {
  return users.map(({ id }) => ({ id: String(id) }));
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

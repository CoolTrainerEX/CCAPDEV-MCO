import { notFound } from "next/navigation";
import { getUser } from "../../../src/sample.ts";

export default async function User(
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  const user = getUser(Number.parseInt((await params).id));

  if (!user) notFound();

  return <p>{user.id}</p>;
}

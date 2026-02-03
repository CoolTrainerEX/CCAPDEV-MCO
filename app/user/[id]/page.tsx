import { notFound } from "next/navigation";

export default async function User(
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  const id = Number.parseInt((await params).id);

  if (Number.isNaN(id)) notFound();

  return <p>{id}</p>;
}

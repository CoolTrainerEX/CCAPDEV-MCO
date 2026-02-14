import { getLab, getLabs } from "@/src/sample";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const name = getLab(Number.parseInt((await params).id))?.name;

  return {
    title: name,
  };
}

export function generateStaticParams() {
  return getLabs().map(({ id }) => ({ id: String(id) }));
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

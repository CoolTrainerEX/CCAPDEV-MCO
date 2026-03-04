import { ReadLabParams } from "@/src/api/endpoints/lab/lab.zod";
import { getLab } from "@/src/sample";

export async function generateMetadata({
  params,
}: {
  params: LayoutProps<"/lab/[id]">;
}) {
  const name = getLab(ReadLabParams.parse(params).id)?.name;

  return {
    title: name,
  };
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

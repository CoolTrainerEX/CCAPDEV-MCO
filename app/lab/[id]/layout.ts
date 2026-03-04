import { ReadLabParams } from "@/src/api/endpoints/lab/lab.zod";
import { getLab } from "@/src/sample";

// eslint-disable-next-line jsdoc/require-jsdoc
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

// eslint-disable-next-line jsdoc/require-jsdoc
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

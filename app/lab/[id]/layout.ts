import { ReadLabParams } from "@/src/api/endpoints/lab/lab.zod";
import { getLab } from "@/src/sample";

// eslint-disable-next-line jsdoc/require-jsdoc
export async function generateMetadata(props: LayoutProps<"/lab/[id]">) {
  const params = ReadLabParams.parse(await props.params);

  return {
    title: getLab(params.id)?.name,
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

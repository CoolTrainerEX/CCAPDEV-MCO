import {
  ReadLabParams,
  ReadLabResponse,
} from "@/src/api/endpoints/lab/lab.zod";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

// eslint-disable-next-line jsdoc/require-jsdoc
export async function generateMetadata(props: LayoutProps<"/lab/[id]">) {
  const params = ReadLabParams.safeParse(await props.params).data;
  const lab = await fetch(`${baseUrl}/api/lab/${params?.id ?? Number.NaN}`);

  if (lab.ok && lab.status === 200)
    return {
      title: ReadLabResponse.safeParse(await lab.json()).data?.name,
    };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

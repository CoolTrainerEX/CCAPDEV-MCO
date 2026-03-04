import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

// eslint-disable-next-line jsdoc/require-jsdoc
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

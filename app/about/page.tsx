import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Globe, Mail } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function About() {
  return (
    <div className="mx-auto mb-50 flex max-w-2xl flex-col items-center gap-20">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        About
      </h1>
      <p className="text-muted-foreground text-justify text-xl">
        We're a group of students aiming to provide students and faculty with an
        efficient and reliable platform for reserving computer laboratories,
        helping reduce schedule conflicts and improve access to available
        workstations. With increasing demand for computer laboratory access, the
        need for an efficient laboratory system has become more essential to
        ensure students and faculty have access to computers whenever they need
        them.
      </p>
      <h2 className="w-full scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Libraries
      </h2>
      <div className="flex w-full flex-col gap-2 text-sm">
        <dl className="flex items-center justify-between">
          <dt>argon2</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://www.npmjs.com/package/argon2" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>date-fns</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://date-fns.org/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>ESLint</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://eslint.org/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>jose</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://www.npmjs.com/package/jose" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Next.js</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://nextjs.org/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Orval</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://orval.dev/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>pino</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://getpino.io/#/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Playwright</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://playwright.dev/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Prettier</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://prettier.io/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Prisma</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://www.prisma.io/orm" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>shadcn/ui</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://ui.shadcn.com/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Tailwind CSS</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://tailwindcss.com/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Tanstack Query</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://tanstack.com/query/latest" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>TypeDoc</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://typedoc.org/index.html" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Vitest</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://vitest.dev/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Zod</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="https://zod.dev/" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Zustand</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link
                href="https://zustand.docs.pmnd.rs/learn/getting-started/introduction"
                target="_blank"
              >
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
      </div>
      <h2 className="w-full scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Members
      </h2>
      <div className="flex w-full flex-col gap-2 text-sm">
        <dl className="flex items-center justify-between">
          <dt>Justin Ryan Uy</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="mailto:justin_ryan_uy@dlsu.edu.ph">
                <Mail />
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="https://CoolTrainerEX.github.io" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Anie Guo</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="mailto:anie_guo@dlsu.edu.ph">
                <Mail />
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="https://www.facebook.com/anie.guo" target="_blank">
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between">
          <dt>Andrea Jadyn Tan</dt>
          <dd className="text-muted-foreground">
            <Button variant="link" asChild>
              <Link href="mailto:andrea_jadyn_tan@dlsu.edu.ph">
                <Mail />
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link
                href="https://www.facebook.com/andreajadyn.tan.3"
                target="_blank"
              >
                <Globe />
              </Link>
            </Button>
          </dd>
        </dl>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { useLogin } from "@/src/api/endpoints/user/user";
import { LoginBody } from "@/src/api/endpoints/user/user.zod";
import useUser from "@/src/store/login";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const login = useUser(({ login }) => login);
  const { mutate, isPending } = useLogin({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 200:
            login(data.data);
            router.push("/");
            toast.success("Logged in.");
            break;

          case 400:
          case 404:
            toast.error(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }
      },
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              action={(formData) => {
                try {
                  mutate({
                    data: LoginBody.parse(
                      Object.fromEntries(formData.entries()),
                    ),
                  });
                } catch {
                  toast.error("Invalid fields.");
                }
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan_dela_cruz@dlsu.edu.ph"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={isPending}>
                    Login
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/register">Register</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
import { useRouter } from "next/navigation";
import useUser from "@/src/store/login";
import { useCreateUser } from "@/src/api/endpoints/user/user";
import { toast } from "sonner";
import { CreateUserBody } from "@/src/api/endpoints/user/user.zod";

export default function Register() {
  const router = useRouter();
  const login = useUser(({ login }) => login);
  const { mutate, isPending } = useCreateUser({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 201:
            login(data.data);
            router.push("/");
            toast.success("Logged in.");
            break;

          case 400:
          case 409:
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
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              action={(formData) => {
                const data = Object.fromEntries(formData.entries());

                if (data["password"] !== data["confirm-password"]) {
                  toast.error("Passwords do not match.");
                  return;
                }

                try {
                  mutate({
                    data: CreateUserBody.parse({
                      name: {
                        first: data["firstname"],
                        last: data["lastname"],
                      },
                      ...data,
                    }),
                  });
                } catch {
                  toast.error("Invalid fields.");
                }
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                  <Input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder="Juan"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                  <Input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder="Dela Cruz"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan_dela_cruz@dlsu.edu.ph"
                    required
                  />
                  <FieldDescription>
                    We&apos;ll use this to contact you. We will not share your
                    email with anyone else.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                  />
                  <FieldDescription>
                    Please confirm your password.
                  </FieldDescription>
                </Field>
                <FieldGroup>
                  <Field>
                    <Button type="submit" disabled={isPending}>
                      Create Account
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Already have an account?{" "}
                      <Link href="/login">Sign in</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

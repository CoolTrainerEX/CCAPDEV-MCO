import Link from "next/link";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field.tsx";
import { Input } from "../../components/ui/input.tsx";

export default function Register() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Register to your account</CardTitle>
            <CardDescription>
              Enter your details below to register your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fname">First Name</FieldLabel>
                  <Input
                    id="fname"
                    type="text"
                    placeholder="Juan"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lname">Last Name</FieldLabel>
                  <Input
                    id="lname"
                    type="text"
                    placeholder="Dela Cruz"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@dlsu.edu.ph"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password-confirm">
                    Confirm Password
                  </FieldLabel>
                  <Input id="password-confirm" type="password" required />
                </Field>
                <Field>
                  <Button type="submit">Register</Button>
                  <FieldDescription className="text-center">
                    Already have an account? <Link href="/login">Login</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

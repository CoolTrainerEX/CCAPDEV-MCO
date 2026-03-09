"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Reservation, { ReservationContent } from "@/app/reservation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Form from "next/form";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  useDeleteUser,
  useLogout,
  useReadUser,
  useUpdateUser,
} from "@/src/api/endpoints/user/user";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";
import {
  DeleteUserParams,
  ReadUserParams,
  ReadUserResponse,
  UpdateUserBody,
  UpdateUserParams,
} from "@/src/api/endpoints/user/user.zod";
import { useReadReservationUser } from "@/src/api/endpoints/reservation/reservation";
import {
  ReadReservationUserParams,
  ReadReservationUserResponse,
} from "@/src/api/endpoints/reservation/reservation.zod";
import { Spinner } from "@/components/ui/spinner";

// eslint-disable-next-line jsdoc/require-jsdoc
export default function User() {
  const params = ReadUserParams.safeParse(useParams()).data;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isSuccess } = useReadUser(params?.id ?? "");
  let user: z.infer<typeof ReadUserResponse> | undefined;

  if (isSuccess)
    switch (data.status) {
      case 200:
        try {
          user = ReadUserResponse.parse(data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
        toast.error(data.data.message);
        break;

      case 404:
        break;

      case 500:
        toast.warning(data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  const reservationsQuery = useReadReservationUser(
    ReadReservationUserParams.safeParse(user).data?.id ?? "",
    {
      query: { enabled: isSuccess && data.status === 200 },
    },
  );

  let reservations: z.infer<typeof ReadReservationUserResponse> | undefined;

  if (reservationsQuery.isSuccess)
    switch (reservationsQuery.data.status) {
      case 200:
        try {
          reservations = ReadReservationUserResponse.parse(
            reservationsQuery.data.data,
          );
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
        toast.error(reservationsQuery.data.data.message);
        break;
      case 404:
        break;

      case 500:
        toast.warning(reservationsQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }

  const { mutate: mutateUpdateUser } = useUpdateUser({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Updated user.");
            break;

          case 400:
          case 401:
          case 404:
            toast.error(data.data.message);
            break;

          case 500:
            toast.warning(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }

        queryClient.invalidateQueries();
      },
    },
  });

  const { mutate: mutateDeleteUser } = useDeleteUser({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Deleted user.");
            break;

          case 400:
          case 401:
          case 404:
            toast.error(data.data.message);
            break;

          case 500:
            toast.warning(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }

        queryClient.invalidateQueries();
        router.refresh();
      },
    },
  });

  const { mutate: mutateLogout } = useLogout({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Logged out.");
            break;

          case 401:
            toast.error(data.data.message);
            break;

          case 500:
            toast.warning(data.data.message);
            break;

          default:
            toast.warning("Unexpected error.");
            break;
        }

        queryClient.invalidateQueries();
        router.refresh();
      },
    },
  });

  return (
    <>
      {(() => {
        if (isSuccess && user)
          return (
            <>
              <div className="container m-auto flex items-center justify-center gap-6">
                <Avatar size="lg">
                  <AvatarImage src="" />
                  <AvatarFallback>{user.name.first[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-baseline justify-center gap-6">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                      {user.name.first} {user.name.last}
                    </h1>
                    {user.admin && <Badge>Admin</Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">{user.id}</p>
                </div>
                {user.editable && (
                  <>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">
                          <Pencil />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm overflow-y-auto">
                          <DrawerHeader>
                            <DrawerTitle>Edit Profile</DrawerTitle>
                          </DrawerHeader>
                          <Form
                            action={(formData) => {
                              const data = Object.fromEntries(
                                formData.entries(),
                              );

                              if (
                                data["password"] !== data["confirm-password"]
                              ) {
                                toast.error("Passwords do not match.");
                                return;
                              }

                              try {
                                mutateUpdateUser({
                                  ...UpdateUserParams.parse(user),
                                  data: UpdateUserBody.parse({
                                    name: {
                                      first: data["firstname"],
                                      last: data["lastname"],
                                    },
                                    ...data,
                                    password: data["password"] || undefined,
                                  } as z.infer<typeof UpdateUserBody>),
                                });
                              } catch {
                                toast.error("Invalid fields.");
                              }
                            }}
                          >
                            <div className="p-4 pb-0">
                              <div className="flex items-center justify-center space-x-2">
                                <FieldGroup>
                                  <Field>
                                    <FieldLabel htmlFor="firstname">
                                      First Name
                                    </FieldLabel>
                                    <Input
                                      id="firstname"
                                      name="firstname"
                                      type="text"
                                      placeholder="Juan"
                                      defaultValue={user.name.first}
                                      required
                                    />
                                  </Field>
                                  <Field>
                                    <FieldLabel htmlFor="lastname">
                                      Last Name
                                    </FieldLabel>
                                    <Input
                                      id="lastname"
                                      name="lastname"
                                      type="text"
                                      placeholder="Dela Cruz"
                                      defaultValue={user.name.last}
                                      required
                                    />
                                  </Field>
                                  <Field>
                                    <FieldLabel htmlFor="description">
                                      Description
                                    </FieldLabel>
                                    <Textarea
                                      id="description"
                                      name="description"
                                      placeholder="Type your description here."
                                      defaultValue={user.description}
                                    />
                                  </Field>
                                  <Field>
                                    <FieldLabel htmlFor="password">
                                      Password
                                    </FieldLabel>
                                    <Input
                                      id="password"
                                      name="password"
                                      type="password"
                                      minLength={8}
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
                                    />
                                    <FieldDescription>
                                      Please confirm your password.
                                    </FieldDescription>
                                  </Field>
                                </FieldGroup>
                              </div>
                            </div>
                            <DrawerFooter>
                              <Button type="submit">Update</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete your account from our
                                      servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        try {
                                          mutateDeleteUser(
                                            DeleteUserParams.parse(user),
                                          );
                                        } catch {
                                          toast.error("Invalid request.");
                                        }
                                      }}
                                    >
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <DrawerClose asChild>
                                <Button variant="outline" type="reset">
                                  Cancel
                                </Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </Form>
                        </div>
                      </DrawerContent>
                    </Drawer>
                    <Button
                      variant="destructive"
                      onClick={() => mutateLogout()}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
              <p className="mx-auto mt-6 w-fit italic">{user.description}</p>
            </>
          );
        else if (isPending)
          return (
            <div className="container m-auto flex items-center justify-center gap-6">
              <Spinner className="size-8" />
              <h1 className="scroll-m-20 text-4xl tracking-tight text-balance">
                Loading...
              </h1>
            </div>
          );
        else notFound();
      })()}
      <Separator className="my-6" />
      {
        <div className="flex justify-around gap-6">
          {(() => {
            if (reservationsQuery.isSuccess && reservations)
              return reservations.map((value) => (
                <Reservation key={value.id} reservation={value}>
                  <ReservationContent reservation={value} />
                </Reservation>
              ));
            else if (
              reservationsQuery.isSuccess &&
              reservationsQuery.data.status === 404
            )
              return (
                <p className="text-center leading-7 not-first:mt-6">
                  No reservations.
                </p>
              );
            else if (reservationsQuery.isPending)
              return (
                <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
                  <Spinner />
                  Loading...
                </p>
              );
            else
              return (
                <p className="flex text-center leading-7 not-first:mt-6">
                  Error fetching reservations.
                </p>
              );
          })()}
        </div>
      }
    </>
  );
}

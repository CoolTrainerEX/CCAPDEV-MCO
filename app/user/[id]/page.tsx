"use client";
import { notFound, useParams } from "next/navigation";
import { deleteUser, getReservationsFromUser, getUser } from "@/src/sample";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Reservation, { ReservationContent } from "@/app/reservation";
import useLogin from "@/src/store/login";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
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
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
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

export default function User() {
  const loginId = useLogin(({ login: { id } }) => id);
  const logout = useLogin(({ logout }) => logout);
  const { id, name, description, admin, editable } =
    getUser(Number.parseInt(useParams<{ id: string }>().id), loginId) ??
    notFound();

  const reservations = getReservationsFromUser(id, loginId);

  return (
    <>
      <div className="container m-auto flex items-center justify-center gap-6">
        <Avatar size="lg">
          <AvatarImage src="" />
          <AvatarFallback>{name.first[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-baseline justify-center gap-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              {name.first} {name.last}
            </h1>
            {admin && <Badge>Admin</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">{id}</p>
        </div>
        {editable && (
          <>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">
                  <PencilIcon />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Edit Profile</DrawerTitle>
                  </DrawerHeader>
                  <Form action="/">
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
                              value={name.first}
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
                              value={name.last}
                              required
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="description">
                              Message
                            </FieldLabel>
                            <Textarea
                              id="description"
                              placeholder="Type your description here."
                              value={description}
                            />
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
                              permanently delete your account from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteUser(id, loginId);
                                logout();
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
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
      <p className="mx-auto mt-6 w-fit italic">{description}</p>
      <Separator className="my-6" />
      <div className="flex justify-around gap-6">
        {reservations?.length ? (
          reservations.map((value) => (
            <Reservation key={value.id} reservation={value}>
              <ReservationContent reservation={value} />
            </Reservation>
          ))
        ) : (
          <p className="text-center leading-7 not-first:mt-6">
            No reservations.
          </p>
        )}
      </div>
    </>
  );
}

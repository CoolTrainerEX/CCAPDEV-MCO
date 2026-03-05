"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Slots from "./slots";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { Plus, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "../lib/utils";
import { startOfDay, isWithinInterval, toDate } from "date-fns";
import {
  readCurrentUserResponse,
  readUserResponse,
  useReadCurrentUser,
  useReadUser,
} from "@/src/api/endpoints/user/user";
import {
  ReadCurrentUserResponse,
  ReadUserParams,
  ReadUserResponse,
} from "@/src/api/endpoints/user/user.zod";
import { toast } from "sonner";
import {
  readLabsResponse,
  useReadLabsInfinite,
} from "@/src/api/endpoints/lab/lab";
import {
  ReadLabsQueryParams,
  ReadLabsResponse,
} from "@/src/api/endpoints/lab/lab.zod";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useQueries } from "@tanstack/react-query";
import {
  getReadReservationLabQueryOptions,
  useReadReservationLab,
} from "@/src/api/endpoints/reservation/reservation";
import {
  ReadReservationLabParams,
  ReadReservationLabResponse,
} from "@/src/api/endpoints/reservation/reservation.zod";

/**
 * Parses the current user ID from the query.
 * @param {ReturnType<typeof useReadCurrentUser>} currentUserQuery Current user query
 * @returns {z.infer<typeof ReadCurrentUserResponse> | undefined} Parsed current user ID
 */
function getCurrentUser(
  currentUserQuery: ReturnType<
    typeof useReadCurrentUser<readCurrentUserResponse>
  >,
) {
  if (currentUserQuery.isSuccess)
    switch (currentUserQuery.data.status) {
      case 200:
        try {
          return ReadCurrentUserResponse.parse(currentUserQuery.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 401:
        break;
      case 404:
        toast.error(currentUserQuery.data.data.message);
        break;

      case 500:
        toast.warning(currentUserQuery.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }
}

/**
 * Parses the user from the query.
 * @param {ReturnType<typeof useReadUser>} user User query
 * @returns {z.infer<typeof ReadUserResponse> | undefined} Parsed user
 */
function getUser(user: ReturnType<typeof useReadUser<readUserResponse>>) {
  if (user.isSuccess)
    switch (user.data.status) {
      case 200:
        try {
          return ReadUserResponse.parse(user.data.data);
        } catch {
          toast.warning("Bad response.");
        }
        break;

      case 400:
      case 404:
        toast.error(user.data.data.message);
        break;

      case 500:
        toast.warning(user.data.data.message);
        break;

      default:
        toast.warning("Unexpected error.");
        break;
    }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export default function Home() {
  const currentUserQuery = useReadCurrentUser();
  const currentUser = getCurrentUser(currentUserQuery) ?? Number.NaN;

  const user = useReadUser(
    ReadUserParams.safeParse({ id: currentUser }).data?.id ?? Number.NaN,
    {
      query: {
        enabled:
          currentUserQuery.isSuccess && currentUserQuery.data.status === 200,
      },
    },
  );

  const admin = getUser(user)?.admin;

  const { data, hasNextPage, fetchNextPage, isPending, isSuccess } =
    useReadLabsInfinite(
      ReadLabsQueryParams.safeParse(
        Object.fromEntries(useSearchParams().entries()),
      ).data,
      {
        query: {
          initialPageParam: 1,
          getNextPageParam(lastPage, _, lastPageParam) {
            if (
              lastPage.status === 200 &&
              lastPage.data.hasNextPage &&
              lastPageParam
            )
              return lastPageParam + 1;
          },
        },
      },
    );

  const labs: z.infer<typeof ReadLabsResponse>["data"] = [];
  let status: readLabsResponse["status"] | undefined;

  if (isSuccess)
    for (const page of data.pages) {
      switch (page.status) {
        case 200:
          try {
            labs.push(...ReadLabsResponse.parse(page.data).data);
          } catch {
            toast.warning("Bad response.");
          }
          break;

        case 400:
          toast.error(page.data.message);
          break;
        case 404:
          break;

        case 500:
          toast.warning(page.data.message);
          break;

        default:
          toast.warning("Unexpected error.");
          break;
      }

      status = page.status;

      if (page.status !== 200) break;
    }

  const reservationsQueries = useQueries({
    queries: labs.map(({ id }) =>
      getReadReservationLabQueryOptions(
        ReadReservationLabParams.safeParse({ id }).data?.id ?? Number.NaN,
        { query: { enabled: isSuccess && status === 200 } },
      ),
    ),
  });

  const now = new Date();

  /**
   * Gets the reservation query of the specified lab.
   * @param {number} id Lab ID
   * @returns {ReturnType<typeof useReadReservationLab>} Reservation query
   */
  function getReservationQuery(id: number) {
    return reservationsQueries[labs.findIndex((value) => value.id === id)];
  }

  return (
    <>
      <Form action="/" className="mx-auto w-md max-w-full">
        <Field orientation="horizontal">
          <Input type="search" name="q" placeholder="Search" />
          <Button type="submit">
            <Search />
          </Button>
          {admin && (
            <Button variant="secondary" asChild>
              <Link href="/lab/create">
                <Plus />
              </Link>
            </Button>
          )}
        </Field>
      </Form>
      <Separator className="my-6" />
      <div className="container m-auto flex flex-wrap justify-around gap-6">
        {(() => {
          if (isSuccess && status === 200)
            return labs.map(({ id, name, weeklySchedule, slots }) => {
              const reservationsQuery = getReservationQuery(id);

              let reservations;

              if (reservationsQuery.isSuccess)
                switch (reservationsQuery.data.status) {
                  case 200:
                    try {
                      reservations = ReadReservationLabResponse.parse(
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

              const reserved = reservations
                ?.filter(({ schedule }) => isWithinInterval(now, schedule))
                .flatMap(({ slotIds }) => slotIds);

              const schedule =
                weeklySchedule[
                  (
                    [
                      "sunday",
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ] as (keyof typeof weeklySchedule)[]
                  )[startOfDay(now).getDay()]
                ];

              // eslint-disable-next-line jsdoc/require-returns
              /**
               * Function to render slots.
               * @param {Parameters<Parameters<typeof Slots>[0]["children"]>[0]} param0 Slot
               * @param {number} param0.id Slot ID
               */
              function slotFunc({
                id,
              }: Parameters<Parameters<typeof Slots>[0]["children"]>[0]) {
                return (
                  <div
                    className={cn(
                      "h-full w-full",
                      reserved?.includes(id) ? "bg-primary" : "bg-muted",
                    )}
                  />
                );
              }

              return (
                <Card key={id} className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardAction>
                      <Button variant="link" asChild>
                        <Link href={`/lab/${id}`}>Reserve</Link>
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      if (
                        reservationsQuery.isSuccess &&
                        (reservationsQuery.data.status === 200 ||
                          reservationsQuery.data.status === 404)
                      )
                        return (
                          <Slots className="aspect-video" slots={slots}>
                            {slotFunc}
                          </Slots>
                        );
                      else if (reservationsQuery.isPending)
                        return (
                          <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
                            <Spinner />
                            Loading...
                          </p>
                        );
                      else return "Error fetching reservations.";
                    })()}
                  </CardContent>
                  <CardFooter>
                    {schedule
                      ? Intl.DateTimeFormat(undefined, {
                          timeStyle: "short",
                        }).formatRange(
                          toDate(schedule.start),
                          toDate(schedule.end),
                        )
                      : "Closed today"}
                  </CardFooter>
                </Card>
              );
            });
          else if (isSuccess && status === 404)
            return (
              <p className="text-center leading-7 not-first:mt-6">No labs.</p>
            );
          else if (isPending)
            return (
              <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
                <Spinner />
                Loading...
              </p>
            );
          else
            return (
              <p className="text-center leading-7 not-first:mt-6">
                Error fetching labs.
              </p>
            );
        })()}
      </div>
      {hasNextPage && (
        <Button
          className="mx-auto my-6 block"
          variant="outline"
          onClick={() => fetchNextPage()}
        >
          View more
        </Button>
      )}
    </>
  );
}

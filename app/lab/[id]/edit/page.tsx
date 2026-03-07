"use client";
import LabForm from "@/app/lab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  useDeleteLab,
  useReadLab,
  useUpdateLab,
} from "@/src/api/endpoints/lab/lab";
import {
  DeleteLabParams,
  ReadLabResponse,
  UpdateLabBody,
  UpdateLabParams,
} from "@/src/api/endpoints/lab/lab.zod";
import { useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

// eslint-disable-next-line jsdoc/require-jsdoc
export default function EditLab() {
  const queryClient = useQueryClient();
  const params = UpdateLabParams.safeParse(useParams()).data;

  const { data, isSuccess, isPending } = useReadLab(params?.id ?? Number.NaN);
  let lab: z.infer<typeof ReadLabResponse> | undefined;

  if (isSuccess)
    switch (data.status) {
      case 200:
        try {
          lab = ReadLabResponse.parse(data.data);
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

  const { mutate: mutateUpdateLab } = useUpdateLab({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Updated lab.");
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

  const { mutate: mutateDeleteLab } = useDeleteLab({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 204:
            toast.success("Deleted lab.");
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

  if (isSuccess && lab)
    return (
      <>
        <div className="container m-auto flex justify-center gap-6">
          <div>
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
              {lab.name}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {lab.id}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  lab from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    try {
                      mutateDeleteLab(DeleteLabParams.parse(lab));
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
        </div>
        <Separator className="my-6" />
        <LabForm
          lab={lab}
          submitValue="Update"
          action={(data) => {
            try {
              mutateUpdateLab({
                ...UpdateLabParams.parse(lab),
                data: UpdateLabBody.parse(data),
              });
            } catch {
              toast.error("Invalid fields.");
            }
          }}
        />
      </>
    );
  else if (isPending)
    return (
      <p className="flex items-center justify-center gap-2 text-center leading-7 not-first:mt-6">
        <Spinner />
        Loading...
      </p>
    );
  else notFound();
}

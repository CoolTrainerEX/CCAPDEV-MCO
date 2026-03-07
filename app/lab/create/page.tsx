"use client";
import LabForm from "@/app/lab";
import { useCreateLab } from "@/src/api/endpoints/lab/lab";
import { CreateLabBody } from "@/src/api/endpoints/lab/lab.zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// eslint-disable-next-line jsdoc/require-jsdoc
export default function CreateLab() {
  const queryClient = useQueryClient();

  const { mutate } = useCreateLab({
    mutation: {
      onSuccess(data) {
        switch (data.status) {
          case 201:
            toast.success("Created lab.");
            break;

          case 400:
          case 401:
          case 409:
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

  return (
    <LabForm
      submitValue="Create"
      action={(data) => {
        try {
          mutate({ data: CreateLabBody.parse(data) });
        } catch {
          toast.error("Invalid fields.");
        }
      }}
    />
  );
}

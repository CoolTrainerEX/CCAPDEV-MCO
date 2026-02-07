import { create } from "zustand";
import { login } from "@/src/sample.ts";

export default create<ReturnType<typeof login>>(() => (login()));

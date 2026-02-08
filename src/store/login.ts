import { create } from "zustand";
import { login } from "@/src/sample.ts";

/**
 * Stores the current user.
 *
 * @returns User metadata
 * @author Justin Ryan Uy
 */
export default create<ReturnType<typeof login>>(() => (login()));

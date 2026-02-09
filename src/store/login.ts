import { create } from "zustand";
import { login } from "@/src/sample.ts";

/**
 * Stores the current user.
 *
 * @author Justin Ryan Uy
 */
export default create(() => (login()));

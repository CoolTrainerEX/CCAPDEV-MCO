import { create } from "zustand";
import { login } from "@/src/sample";

/**
 * Stores the current user.
 *
 * @author Justin Ryan Uy
 */
export default create<{ login: ReturnType<typeof login>; logout: () => void }>(
  (set) => ({
    login: login(),
    logout: () => set({ login: { id: 0 } }),
  }),
);

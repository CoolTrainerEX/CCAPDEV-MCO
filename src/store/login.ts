import { create } from "zustand";
import { login } from "@/src/sample";

/**
 * Stores the current user.
 *
 * @author Justin Ryan Uy
 */
export default create<{ id: number; logout: () => void }>((set) => ({
  id: login(),
  logout: () => set({ id: Number.NaN }),
}));

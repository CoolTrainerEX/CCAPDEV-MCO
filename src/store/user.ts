import { create } from "zustand";

/**
 * Stores the current user.
 * @author Justin Ryan Uy
 */
export default create<{
  id: number;
  login: (id: number) => void;
  logout: () => void;
}>((set) => ({
  id: Number.NaN,
  login: (id) => set({ id }),
  logout: () => set({ id: Number.NaN }),
}));

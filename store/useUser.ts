import { create } from "zustand";

export const useUser = create<
  {
    userID: number;
    username: string;
    login: (email: string, password: string) => unknown;
  }
>((set) => ({
  userID: 1,
  username: "joe",
  login: (_email, _password) => set({ userID: 1 }),
}));

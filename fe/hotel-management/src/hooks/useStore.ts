import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/userService";

export interface StoreState {
  user?: User | null;
  setUser: (user: User | null | undefined) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      removeUser: () => set({ user: null }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

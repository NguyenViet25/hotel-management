import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/userService";

export interface StoreState {
  user?: User | null;
  hotelId?: string | null;
  setUser: (user: User | null | undefined) => void;
  removeUser: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      hotelId: null,
      setUser: (user) => set({ user, hotelId: user?.hotelId }),
      removeUser: () => set({ user: null, hotelId: null }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ user: state.user, hotelId: state.hotelId }),
    }
  )
);

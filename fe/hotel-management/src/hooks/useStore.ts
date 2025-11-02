import { create } from "zustand";
import type { User } from "../api/userService";

// Define the shape of the store
export interface StoreState {
  user?: User | null;
  setUser: (user: User | null | undefined) => void;
}

// Create the Zustand store with types
export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user: User | null | undefined) => set({ user }),
}));

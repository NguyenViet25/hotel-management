import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { DesignerState, Floor, Room } from "./types";

// Mock seed data shown when localStorage is empty
const initialMock: Floor[] = [
  {
    id: nanoid(),
    title: "Floor 1",
    rooms: [
      { id: nanoid(), number: "101", type: "Single", status: "Available" },
      { id: nanoid(), number: "102", type: "Double", status: "Occupied" },
      { id: nanoid(), number: "103", type: "Suite", status: "Cleaning" },
    ],
  },
  {
    id: nanoid(),
    title: "Floor 2",
    rooms: [
      { id: nanoid(), number: "201", type: "Deluxe", status: "Available" },
      { id: nanoid(), number: "202", type: "Meeting", status: "Maintenance" },
      { id: nanoid(), number: "203", type: "Single", status: "Available" },
    ],
  },
];

// Central state for the Room Designer with localStorage persistence
export const useDesignerStore = create<DesignerState>()(
  persist(
    (set, get) => ({
      floors: initialMock,

      // Create a new floor at the top of the stack
      addFloor: (title: string) => {
        const newFloor: Floor = { id: nanoid(), title, rooms: [] };
        set((s) => ({ floors: [newFloor, ...s.floors] }));
      },

      removeFloor: (floorId: string) => {
        set((s) => ({ floors: s.floors.filter((f) => f.id !== floorId) }));
      },

      // Reorder floors within the vertical list
      reorderFloors: (sourceIndex: number, destinationIndex: number) => {
        set((s) => {
          const floors = [...s.floors];
          const [moved] = floors.splice(sourceIndex, 1);
          floors.splice(destinationIndex, 0, moved);
          return { floors };
        });
      },

      // Append a new room to a floor
      addRoom: (floorId: string, room: Room) => {
        set((s) => ({
          floors: s.floors.map((f) =>
            f.id === floorId ? { ...f, rooms: [...f.rooms, room] } : f
          ),
        }));
      },

      // Update properties on a specific room
      updateRoom: (floorId: string, roomId: string, patch: Partial<Room>) => {
        set((s) => ({
          floors: s.floors.map((f) =>
            f.id === floorId
              ? {
                  ...f,
                  rooms: f.rooms.map((r) =>
                    r.id === roomId ? { ...r, ...patch } : r
                  ),
                }
              : f
          ),
        }));
      },

      removeRoom: (floorId: string, roomId: string) => {
        set((s) => ({
          floors: s.floors.map((f) =>
            f.id === floorId
              ? { ...f, rooms: f.rooms.filter((r) => r.id !== roomId) }
              : f
          ),
        }));
      },

      // Move a room across different floors
      moveRoomBetweenFloors: (
        sourceFloorId,
        destinationFloorId,
        sourceIndex,
        destinationIndex
      ) => {
        set((s) => {
          const floors = [...s.floors];
          const sourceFloor = floors.find((f) => f.id === sourceFloorId);
          const destFloor = floors.find((f) => f.id === destinationFloorId);
          if (!sourceFloor || !destFloor) return { floors };
          const [moved] = sourceFloor.rooms.splice(sourceIndex, 1);
          destFloor.rooms.splice(destinationIndex, 0, moved);
          return { floors };
        });
      },

      // Reorder rooms inside one floor
      reorderRoomsWithinFloor: (floorId, sourceIndex, destinationIndex) => {
        set((s) => {
          const floors = s.floors.map((f) => {
            if (f.id !== floorId) return f;
            const rooms = [...f.rooms];
            const [moved] = rooms.splice(sourceIndex, 1);
            rooms.splice(destinationIndex, 0, moved);
            return { ...f, rooms };
          });
          return { floors };
        });
      },

      resetWithMock: (floors: Floor[]) => set({ floors }),
    }),
    {
      // Key used by persist in localStorage
      name: "room-designer-store",
    }
  )
);

import {
  Hotel as HotelIcon,
  KingBed,
  MeetingRoom,
  SingleBed,
} from "@mui/icons-material";
import { blue, green, grey, orange, purple } from "@mui/material/colors";
import type { ReactNode } from "react";

export type RoomStatus = "Available" | "Occupied" | "Cleaning" | "Maintenance";

export type RoomType = "Single" | "Double" | "Suite" | "Deluxe" | "Meeting";

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
}

export interface Floor {
  id: string;
  title: string; // e.g. "Floor 1"
  rooms: Room[];
}

export interface DesignerState {
  floors: Floor[];
  addFloor: (title: string) => void;
  removeFloor: (floorId: string) => void;
  reorderFloors: (sourceIndex: number, destinationIndex: number) => void;
  addRoom: (floorId: string, room: Room) => void;
  updateRoom: (floorId: string, roomId: string, patch: Partial<Room>) => void;
  removeRoom: (floorId: string, roomId: string) => void;
  moveRoomBetweenFloors: (
    sourceFloorId: string,
    destinationFloorId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  reorderRoomsWithinFloor: (
    floorId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  resetWithMock: (floors: Floor[]) => void;
}

export type RoomTypeMeta = {
  label: string;
  icon: ReactNode;
  color: string;
};

export const ROOM_TYPE_META: Record<RoomType, RoomTypeMeta> = {
  Single: { label: "Single", icon: <SingleBed />, color: blue[500] },
  Double: { label: "Double", icon: <KingBed />, color: green[500] },
  Suite: { label: "Suite", icon: <HotelIcon />, color: purple[500] },
  Deluxe: { label: "Deluxe", icon: <KingBed />, color: orange[600] },
  Meeting: { label: "Meeting", icon: <MeetingRoom />, color: grey[700] },
};

export const ROOM_STATUS_OPTIONS: RoomStatus[] = [
  "Available",
  "Occupied",
  "Cleaning",
  "Maintenance",
];

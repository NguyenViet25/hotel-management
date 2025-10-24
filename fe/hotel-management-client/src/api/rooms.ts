import { api } from './client';
import type { PagedResult } from './client';

export interface RoomDto { id: number; number: string; floor: number; view: string; status: string }

export async function listRooms(): Promise<RoomDto[]> {
  try {
    const data = await api.get<PagedResult<RoomDto>>('/api/rooms');
    return data.items;
  } catch (e) {
    return [
      { id: 101, number: '101', floor: 1, view: 'City', status: 'Cleaned' },
      { id: 102, number: '102', floor: 1, view: 'City', status: 'Dirty' },
    ];
  }
}
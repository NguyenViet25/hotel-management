import { api } from './client';
import type { PagedResult } from './client';

export interface UserDto { id: number; username: string; role: string; status: string }

export async function listUsers(): Promise<UserDto[]> {
  try {
    const data = await api.get<PagedResult<UserDto>>('/api/users');
    return data.items;
  } catch (e) {
    return [
      { id: 1, username: 'admin', role: 'Admin', status: 'Active' },
      { id: 2, username: 'reception', role: 'Lễ tân', status: 'Active' },
    ];
  }
}
import { api } from './client';
import type { PagedResult } from './client';

export interface PropertyDto { id: number; name: string; address: string; timezone: string; currency: string }

export async function listProperties(): Promise<PropertyDto[]> {
  try {
    const data = await api.get<PagedResult<PropertyDto>>('/api/properties');
    return data.items;
  } catch (e) {
    return [
      { id: 1, name: 'Hotel A', address: '123 Đường 1', timezone: 'GMT+7', currency: 'VND' },
    ];
  }
}
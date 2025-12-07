import axios from "./axios";

export interface MediaDto {
  id: number;
  fileName: string;
  filePath: string;
  fileUrl: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface MediaUpdateRequest {
  fileName?: string;
  contentType?: string;
  description?: string; // optional client-side, may be ignored by server
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T[];
  meta?: { total?: number; page?: number; pageSize?: number } | null;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T;
}

const mediaApi = {
  async upload(file: File): Promise<ItemResponse<MediaDto>> {
    const form = new FormData();
    form.append("File", file);
    const res = await axios.post(`/media`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async list(page = 1, pageSize = 50): Promise<ListResponse<MediaDto>> {
    const qp = new URLSearchParams();
    qp.append("page", String(page));
    qp.append("pageSize", String(pageSize));
    const res = await axios.get(`/media?${qp.toString()}`);
    return res.data;
  },

  async get(id: number): Promise<ItemResponse<MediaDto>> {
    const res = await axios.get(`/media/${id}`);
    return res.data;
  },

  async update(
    id: number,
    payload: MediaUpdateRequest
  ): Promise<ItemResponse<MediaDto>> {
    const res = await axios.put(`/media/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<ItemResponse<boolean>> {
    const res = await axios.delete(`/media/${id}`);
    return res.data;
  },
};

export default mediaApi;

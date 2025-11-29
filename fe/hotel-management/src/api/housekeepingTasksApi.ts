import axios from "./axios";

export interface HousekeepingTaskDto {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  notes?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface CreateHousekeepingTaskRequest {
  hotelId: string;
  roomId: string;
  assignedToUserId?: string;
  notes?: string;
}

export interface AssignHousekeeperRequest {
  taskId: string;
  assignedToUserId: string;
}

export interface UpdateHousekeepingTaskNotesRequest {
  taskId: string;
  notes?: string;
}

export interface StartTaskRequest {
  taskId: string;
  notes?: string;
}
export interface CompleteTaskRequest {
  taskId: string;
  notes?: string;
  evidenceUrls?: string[];
}

export interface ListHousekeepingTasksQuery {
  hotelId: string;
  assignedToUserId?: string;
  onlyActive?: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data?: T;
}

const housekeepingTasksApi = {
  async create(
    payload: CreateHousekeepingTaskRequest
  ): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.post(`/housekeeping/tasks`, payload);
    return res.data;
  },
  async list(
    params: ListHousekeepingTasksQuery
  ): Promise<ApiResponse<HousekeepingTaskDto[]>> {
    const qp = new URLSearchParams();
    qp.append("hotelId", params.hotelId);
    if (params.assignedToUserId)
      qp.append("assignedToUserId", params.assignedToUserId);
    qp.append("onlyActive", String(params.onlyActive ?? true));
    const res = await axios.get(`/housekeeping/tasks?${qp.toString()}`);
    return res.data;
  },
  async assign(
    payload: AssignHousekeeperRequest
  ): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.put(`/housekeeping/tasks/assign`, payload);
    return res.data;
  },
  async updateNotes(
    payload: UpdateHousekeepingTaskNotesRequest
  ): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.put(`/housekeeping/tasks/notes`, payload);
    return res.data;
  },
  async start(
    payload: StartTaskRequest
  ): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.put(`/housekeeping/tasks/start`, payload);
    return res.data;
  },
  async complete(
    payload: CompleteTaskRequest
  ): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.put(`/housekeeping/tasks/complete`, payload);
    return res.data;
  },
};

export default housekeepingTasksApi;

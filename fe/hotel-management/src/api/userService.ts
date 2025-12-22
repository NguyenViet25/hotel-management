import axios from "./axios";

export interface User {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  status: string;
  fullname?: string;
  phoneNumber?: string;
  propertyRoles?: PropertyRole[];
  lockedUntil?: string | null;
  hotelId: string;
}

export interface PropertyRole {
  id?: string;
  hotelId: string;
  role?: string;
  name?: string;
}

export interface UserListResponse {
  isSuccess: boolean;
  message: string | null;
  data: User[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface UserResponse {
  isSuccess: boolean;
  message: string | null;
  data: User;
}

export interface CreateUserRequest {
  username?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  roles: string[];
  propertyRoles: PropertyRole[];
}

export interface AssignPropertyRoleDto {
  hotelId: string;
  role?: number;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  roles: string[];
  propertyRoles: AssignPropertyRoleDto[];
}

export interface LockUserRequest {
  lockedUntil: string | null;
}

export interface PropertyRoleRequest {
  propertyId: string;
  role: string;
}

export interface PropertyRoleResponse {
  isSuccess: boolean;
  message: string | null;
  data: PropertyRole;
}

const userService = {
  getUsers: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    role?: string
  ): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    const response = await axios.get(`/users?${params.toString()}`);
    return response.data;
  },
  getUsersByHotel: async (
    hotelId: string,
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    role?: string
  ): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    const response = await axios.get(
      `/users/by-hotel/${hotelId}?${params.toString()}`
    );
    return response.data;
  },
  getUsersByRole: async (
    hotelId: string,
    role: "housekeeper"
  ): Promise<UserListResponse> => {
    const response = await axios.get(
      `/users/by-role?hotelId=${hotelId}&role=${role}`
    );
    return response.data;
  },
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (user: CreateUserRequest): Promise<UserResponse> => {
    const response = await axios.post("/users", user);
    return response.data;
  },

  updateUser: async (
    id: string,
    user: UpdateUserRequest
  ): Promise<UserResponse> => {
    const response = await axios.put(`/users/${id}`, user);
    return response.data;
  },

  lockUser: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await axios.post(`/users/${id}/lock`, {});
    return response.data;
  },
  unlockUser: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await axios.post(`/users/${id}/unlock`, {});
    return response.data;
  },

  resetPassword: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await axios.post(`/users/${id}/reset-password`, {
      newPassword: "Password1@",
    });
    return response.data;
  },

  listWaiters: async (): Promise<{
    isSuccess: boolean;
    message: string | null;
    data: User[];
  }> => {
    const response = await axios.get(`/users/waiters`);
    return response.data;
  },

  assignPropertyRole: async (
    id: string,
    propertyRole: PropertyRoleRequest
  ): Promise<PropertyRoleResponse> => {
    const response = await axios.post(
      `/users/${id}/property-roles`,
      propertyRole
    );
    return response.data;
  },
};

export default userService;

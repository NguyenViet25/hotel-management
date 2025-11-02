import axios from "./axios";

export interface User {
  id: string;
  userName: string;
  email: string;
  roles: string;
  status: string;
  fullname?: string;
  phoneNumber?: string;
  propertyRoles?: PropertyRole[];
  isLocked: boolean;
}

export interface PropertyRole {
  propertyId: string;
  propertyName: string;
  role: string;
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
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
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
    pageSize: number = 10
  ): Promise<UserListResponse> => {
    const response = await axios.get(
      `/admin/users?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await axios.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (user: CreateUserRequest): Promise<UserResponse> => {
    const response = await axios.post("/admin/users", user);
    return response.data;
  },

  updateUser: async (
    id: string,
    user: UpdateUserRequest
  ): Promise<UserResponse> => {
    const response = await axios.put(`/admin/users/${id}`, user);
    return response.data;
  },

  lockUser: async (
    id: string,
    lockRequest: LockUserRequest
  ): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await axios.post(`/admin/users/${id}/lock`, lockRequest);
    return response.data;
  },

  resetPassword: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await axios.post(`/admin/users/${id}/reset-password`);
    return response.data;
  },

  assignPropertyRole: async (
    id: string,
    propertyRole: PropertyRoleRequest
  ): Promise<PropertyRoleResponse> => {
    const response = await axios.post(
      `/admin/users/${id}/property-roles`,
      propertyRole
    );
    return response.data;
  },
};

export default userService;

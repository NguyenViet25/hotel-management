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
  id: string;
  hotelId: string;
  role: string;
  name: string;
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
  role: number;
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
    search?: string
  ): Promise<UserListResponse> => {
    const response = await axios.get(
      `/users?page=${page}&pageSize=${pageSize}&search=${search || ""}`
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
    const response = await axios.post(`/users/${id}/reset-password`);
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

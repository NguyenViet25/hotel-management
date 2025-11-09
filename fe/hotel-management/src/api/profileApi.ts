import axiosInstance from "./axios";
import axios from "./axios";

export interface ProfileDto {
  id: string;
  userName?: string;
  email?: string;
  fullname?: string;
  phoneNumber?: string;
  roles: string[];
  twoFactorEnabled: boolean;
}

export interface UpdateProfileRequest {
  email?: string;
  fullname?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const profileApi = {
  getMe: async (): Promise<{ success: boolean; data: ProfileDto }> => {
    const res = await axiosInstance.get("/profile/me");
    return res.data;
  },
  update: async (
    dto: UpdateProfileRequest
  ): Promise<{ success: boolean; data: ProfileDto; message?: string }> => {
    const res = await axiosInstance.put("/profile", dto);
    return res.data;
  },
  changePassword: async (
    dto: ChangePasswordRequest
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await axiosInstance.post("/profile/change-password", dto);
    return res.data;
  },
};

export default profileApi;

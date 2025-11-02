import { Alert, Box, Snackbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "../../../../api/userService";
import userService from "../../../../api/userService";
import type { Column } from "../../../../components/common/DataTable";
import DataTable from "../../../../components/common/DataTable";
import CreateUserDialog from "./dialogs/CreateUserDialog";
import EditUserDialog from "./dialogs/EditUserDialog";
import LockUserDialog from "./dialogs/LockUserDialog";
import ResetPasswordDialog from "./dialogs/ResetPasswordDialog";
import { getRoleInfo } from "../../../../utils/role-mapper";

const UserManagement: React.FC = () => {
  // State for user list
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // State for sorting
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  // State for selected user
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for form data
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "User",
  });

  // State for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for password reset
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Table columns definition
  const columns: Column<User>[] = [
    { id: "userName", label: "Tên đăng nhập", minWidth: 120, sortable: true },
    { id: "email", label: "Email", minWidth: 180, sortable: true },
    { id: "fullname", label: "Họ và tên", minWidth: 150, sortable: true },
    { id: "email", label: "Email", minWidth: 180, sortable: true },
    { id: "phoneNumber", label: "Số điện thoại", minWidth: 120 },
    {
      id: "roles",
      label: "Vai trò",
      minWidth: 100,
      sortable: true,
      format: (value) => getRoleInfo(value[0]).label || "N/A",
    },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 100,
      format: (value) => (value === "Locked" ? "Đã khóa" : "Hoạt động"),
    },
  ];

  // Fetch users on component mount and when page, pageSize, or sorting changes
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, sortBy, sortDirection]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(page, pageSize);
      console.log("response", response.data);
      if (response.isSuccess) {
        setUsers(response.data);
        setTotal(response.meta.total);
      } else {
        showSnackbar("Không thể tải danh sách người dùng", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Đã xảy ra lỗi khi tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle sort
  const handleSort = (property: string) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });

    // Clear error for this field
    if (formErrors[name as string]) {
      setFormErrors({
        ...formErrors,
        [name as string]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (createDialogOpen) {
      if (!formData.username) {
        errors.username = "Tên đăng nhập không được để trống";
      }

      if (!formData.password) {
        errors.password = "Mật khẩu không được để trống";
      } else if (formData.password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }
    }

    if (!formData.fullName) {
      errors.fullName = "Họ và tên không được để trống";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await userService.createUser(
        formData as CreateUserRequest
      );
      if (response.isSuccess) {
        showSnackbar("Tạo người dùng thành công", "success");
        setCreateDialogOpen(false);
        fetchUsers();
        resetForm();
      } else {
        showSnackbar(response.message || "Không thể tạo người dùng", "error");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar("Đã xảy ra lỗi khi tạo người dùng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!validateForm() || !selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await userService.updateUser(
        selectedUser.id,
        formData as UpdateUserRequest
      );
      if (response.isSuccess) {
        showSnackbar("Cập nhật người dùng thành công", "success");
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        showSnackbar(
          response.message || "Không thể cập nhật người dùng",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar("Đã xảy ra lỗi khi cập nhật người dùng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle lock/unlock user
  const handleLockUser = async () => {
    if (!selectedUser) return;

    const isLocking = selectedUser.status !== "Locked";
    const lockUntil = isLocking
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    setIsSubmitting(true);
    try {
      const response = await userService.lockUser(selectedUser.id, {
        lockedUntil: lockUntil,
      });
      if (response.isSuccess) {
        showSnackbar(
          isLocking
            ? "Khóa tài khoản thành công"
            : "Mở khóa tài khoản thành công",
          "success"
        );
        setLockDialogOpen(false);
        fetchUsers();
      } else {
        showSnackbar(
          response.message || "Không thể thực hiện thao tác",
          "error"
        );
      }
    } catch (error) {
      console.error("Error locking/unlocking user:", error);
      showSnackbar("Đã xảy ra lỗi khi thực hiện thao tác", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.resetPassword(selectedUser.id);
      if (response.isSuccess) {
        showSnackbar("Đặt lại mật khẩu thành công", "success");
        setResetPasswordDialogOpen(false);
        setPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        showSnackbar(response.message || "Không thể đặt lại mật khẩu", "error");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      showSnackbar("Đã xảy ra lỗi khi đặt lại mật khẩu", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }

    // Clear error when typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.userName,
      password: "",
      email: user.email,
      fullName: user.fullname || "",
      phoneNumber: user.phoneNumber || "",
      role: user.roles[0],
    });
    setEditDialogOpen(true);
  };

  // Open lock dialog
  const openLockDialog = (user: User) => {
    setSelectedUser(user);
    setLockDialogOpen(true);
  };

  // Open reset password dialog
  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      role: "User",
    });
    setFormErrors({});
  };

  // Show snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Typography variant="h6" component="h1" gutterBottom>
        Quản lý người dùng
      </Typography>

      <DataTable<User>
        columns={columns}
        data={users}
        title="Danh sách tài khoản"
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
        }}
        onAdd={openCreateDialog}
        onEdit={openEditDialog}
        onLock={openLockDialog}
        onResetPassword={openResetPasswordDialog}
        getRowId={(row) => row.id}
        onSort={handleSort}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSearch={() => {}}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        formData={formData as CreateUserRequest}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        selectedUser={selectedUser}
        formData={formData as UpdateUserRequest}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleUpdateUser}
        isSubmitting={isSubmitting}
      />

      {/* Lock User Dialog */}
      <LockUserDialog
        open={lockDialogOpen}
        onClose={() => setLockDialogOpen(false)}
        selectedUser={selectedUser}
        handleSubmit={handleLockUser}
        isSubmitting={isSubmitting}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
        selectedUser={selectedUser}
        password={password}
        confirmPassword={confirmPassword}
        passwordError={passwordError}
        handlePasswordChange={handlePasswordChange}
        handleSubmit={handleResetPassword}
        isSubmitting={isSubmitting}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;

import { AddCircle } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import type { CreateUserRequest, User } from "../../../../api/userService";
import userService from "../../../../api/userService";
import type { Column } from "../../../../components/common/DataTable";
import DataTable from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import { type StoreState, useStore } from "../../../../hooks/useStore";
import { isLocked } from "../../../../utils/is-locked";
import {
  getAllRoleExceptAdmin,
  getRoleInfo,
} from "../../../../utils/role-mapper";
import CreateUserDialog from "../../admin/user-management/dialogs/CreateUserDialog";
import EditUserDialog from "../../admin/user-management/dialogs/EditUserDialog";
import LockUserDialog from "../../admin/user-management/dialogs/LockUserDialog";
import ResetPasswordDialog from "../../admin/user-management/dialogs/ResetPasswordDialog";

const ManagerUserManagement: React.FC = () => {
  // State for user list
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(" ");
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { hotelId } = useStore<StoreState>((state) => state);
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
    fullName: "",
    phoneNumber: "",
    roles: [],
    propertyRoles: hotelId ? [{ hotelId }] : [],
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

  // Table columns definition
  const columns: Column<User>[] = [
    { id: "userName", label: "Tài khoản", minWidth: 120, sortable: true },
    { id: "fullname", label: "Họ và tên", minWidth: 120, sortable: true },
    { id: "email", label: "Email", minWidth: 180, sortable: true },
    { id: "phoneNumber", label: "Số điện thoại", minWidth: 120 },
    {
      id: "roles",
      label: "Vai trò",
      minWidth: 120,
      sortable: true,
      format: (value) => getRoleInfo(value[0]).label || "N/A",
    },

    {
      id: "lockedUntil",
      label: "Trạng thái",
      minWidth: 120,
      format: (value: string) => {
        if (!value) <Chip size="small" label={"Hoạt động"} color={"primary"} />; // no lock
        const lockedUntilDate = new Date(value);
        const now = new Date();
        return (
          <Chip
            size="small"
            label={lockedUntilDate > now || !value ? "Đã khóa" : "Hoạt động"}
            color={lockedUntilDate > now || !value ? "error" : "primary"}
          />
        );
      },
    },
  ];

  // Fetch users on component mount and when page, pageSize, or sorting changes
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, sortBy, sortDirection, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleFilterParam = roleFilter === " " ? undefined : roleFilter;

      const response = await userService.getUsersByHotel(
        hotelId || "",
        page,
        pageSize,
        search,
        roleFilterParam
      );
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
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => {
    const { name, value } = e.target;
    if (name === "roles") {
      setFormData({
        ...formData,
        roles: [value],
      });
    } else if (name === "propertyRoles") {
      setFormData({
        ...formData,
        propertyRoles: [{ hotelId: value }],
      });
    } else {
      setFormData({
        ...formData,
        [name as string]: value,
      });
    }

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
    }

    if (!formData.fullName) {
      errors.fullName = "Họ và tên không được để trống";
    }

    // TODO: help me check valid phone number (phone number is potional field)
    if (formData.phoneNumber) {
      if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = "Số điện thoại không hợp lệ";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await userService.createUser({
        ...formData,
        propertyRoles: hotelId ? [{ hotelId }] : [],
        roles: formData.roles,
      });

      if (response.isSuccess) {
        showSnackbar("Tạo người dùng thành công", "success");
        setCreateDialogOpen(false);
        fetchUsers();
        resetForm();
      } else {
        showSnackbar(response.message || "Không thể tạo người dùng", "error");
      }
    } catch (error: any) {
      console.error("Error creating user:", error.response.data.message);
      showSnackbar(error.response.data.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!validateForm() || !selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await userService.updateUser(selectedUser.id, {
        ...formData,
        roles: formData.roles,
        propertyRoles: hotelId ? [{ hotelId }] : [],
      });
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

    const isLocking = !isLocked(selectedUser.lockedUntil);
    setIsSubmitting(true);
    try {
      const response = isLocking
        ? await userService.lockUser(selectedUser.id)
        : await userService.unlockUser(selectedUser.id);
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

    setIsSubmitting(true);

    showSnackbar("Đặt lại mật khẩu thành công", "success");
    setResetPasswordDialogOpen(false);
    setIsSubmitting(false);

    try {
      const response = await userService.resetPassword(selectedUser.id);

      if (response.isSuccess) {
        showSnackbar("Đặt lại mật khẩu thành công", "success");
        setResetPasswordDialogOpen(false);
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
      email: user.email,
      fullName: user.fullname || "",
      phoneNumber: user.phoneNumber || "",
      roles: user.roles,
      propertyRoles: user.propertyRoles || [],
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
      fullName: "",
      phoneNumber: "",
      roles: [],
      propertyRoles: [],
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
      <PageTitle
        title="Quản lý người dùng"
        subtitle="Thêm, sửa và quản lý quyền truy cập của người dùng"
      />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent={"space-between"}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <TextField
            placeholder="Tìm kiếm..."
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ width: { xs: "100%", lg: 320 } }}
          />
          <TextField
            select
            label="Vai trò"
            size="small"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=" ">Tất cả</MenuItem>
            {getAllRoleExceptAdmin().map((r) => (
              <MenuItem key={r} value={r}>
                {getRoleInfo(r).label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={openCreateDialog}
        >
          Thêm mới
        </Button>
      </Stack>

      <DataTable<User>
        columns={columns}
        data={
          roleFilter
            ? users.filter((u) => u.roles?.includes(roleFilter))
            : users
        }
        title="Danh sách tài khoản"
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
        }}
        onEdit={openEditDialog}
        onLock={openLockDialog}
        onResetPassword={openResetPasswordDialog}
        getRowId={(row) => row.id}
        onSort={handleSort}
        sortBy={sortBy}
        sortDirection={sortDirection}
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
        enableHotelSelect={false}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        selectedUser={selectedUser}
        formData={formData as any}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleUpdateUser}
        isSubmitting={isSubmitting}
        enableHotelSelect={false}
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

export default ManagerUserManagement;

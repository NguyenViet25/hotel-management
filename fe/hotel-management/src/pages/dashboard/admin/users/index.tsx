import React, { useState, useEffect } from "react";
import { Button, Card, message, Modal, Tag, Space } from "antd";
import {
  PlusOutlined,
  LockOutlined,
  KeyOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import DataTable from "../../../../components/common/DataTable";
import userService, { User } from "../../../../api/userService";
import CreateUserForm from "./CreateUserForm";
import EditUserForm from "./EditUserForm";
import AssignPropertyRoleForm from "./AssignPropertyRoleForm";
import type { ColumnsType } from "antd/es/table";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isCreateModalVisible, setIsCreateModalVisible] =
    useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isPropertyRoleModalVisible, setIsPropertyRoleModalVisible] =
    useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(
        pagination.current,
        pagination.pageSize
      );
      if (response.isSuccess) {
        setUsers(response.data);
        setPagination({
          ...pagination,
          total: response.meta.total,
        });
      } else {
        message.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleCreateUser = async (values: any) => {
    try {
      const response = await userService.createUser(values);
      if (response.isSuccess) {
        message.success("User created successfully");
        setIsCreateModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Failed to create user");
    }
  };

  const handleEditUser = async (values: any) => {
    if (!selectedUser) return;

    try {
      const response = await userService.updateUser(selectedUser.id, values);
      if (response.isSuccess) {
        message.success("User updated successfully");
        setIsEditModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Failed to update user");
    }
  };

  const handleLockUser = (user: User) => {
    Modal.confirm({
      title: user.status === "Locked" ? "Unlock User" : "Lock User",
      content:
        user.status === "Locked"
          ? `Are you sure you want to unlock ${user.userName}?`
          : `Are you sure you want to lock ${user.userName}?`,
      onOk: async () => {
        try {
          const lockUntil =
            user.status === "Locked"
              ? null
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const response = await userService.lockUser(user.id, {
            lockedUntil: lockUntil,
          });
          if (response.isSuccess) {
            message.success(
              response.message || "User status updated successfully"
            );
            fetchUsers();
          } else {
            message.error(response.message || "Failed to update user status");
          }
        } catch (error) {
          console.error("Error updating user status:", error);
          message.error("Failed to update user status");
        }
      },
    });
  };

  const handleResetPassword = (user: User) => {
    Modal.confirm({
      title: "Reset Password",
      content: `Are you sure you want to reset the password for ${user.userName}?`,
      onOk: async () => {
        try {
          const response = await userService.resetPassword(user.id);
          if (response.isSuccess) {
            message.success(response.message || "Password reset successfully");
          } else {
            message.error(response.message || "Failed to reset password");
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          message.error("Failed to reset password");
        }
      },
    });
  };

  const handleAssignPropertyRole = async (values: any) => {
    if (!selectedUser) return;

    try {
      const response = await userService.assignPropertyRole(
        selectedUser.id,
        values
      );
      if (response.isSuccess) {
        message.success("Property role assigned successfully");
        setIsPropertyRoleModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.message || "Failed to assign property role");
      }
    } catch (error) {
      console.error("Error assigning property role:", error);
      message.error("Failed to assign property role");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status === "Active" ? "Đang hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={() => handleLockUser(record)}
            danger={record.status === "Active"}
          >
            {record.status === "Active" ? "Khóa" : "Mở khóa"}
          </Button>
          <Button
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            Reset mật khẩu
          </Button>
          <Button
            icon={<UserSwitchOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setIsPropertyRoleModalVisible(true);
            }}
          >
            Phân quyền
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Card
        title="Quản lý người dùng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Thêm người dùng
          </Button>
        }
      >
        <DataTable
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
          }}
          rowKey="id"
          actionColumn={false}
          onEdit={(record) => {
            setSelectedUser(record);
            setIsEditModalVisible(true);
          }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Thêm người dùng"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <CreateUserForm onFinish={handleCreateUser} />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Sửa thông tin người dùng"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <EditUserForm
            initialValues={selectedUser}
            onFinish={handleEditUser}
          />
        )}
      </Modal>

      {/* Assign Property Role Modal */}
      <Modal
        title="Phân quyền theo cơ sở"
        open={isPropertyRoleModalVisible}
        onCancel={() => setIsPropertyRoleModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <AssignPropertyRoleForm
            userId={selectedUser.id}
            onFinish={handleAssignPropertyRole}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;

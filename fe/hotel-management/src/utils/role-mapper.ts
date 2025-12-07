interface RoleInfo {
  label: string; // Tên tiếng Việt
  description: string; // Mô tả chi tiết
}

// Bản đồ role sang thông tin tiếng Việt
const roleMap: Record<string, RoleInfo> = {
  Admin: {
    label: "Quản trị hệ thống",
    description:
      "Quản trị hệ thống toàn chuỗi: tạo tài khoản, phân quyền, cấu hình giá, quản lý cơ sở, theo dõi audit, thiết lập báo cáo, cấu hình cổng thanh toán và dashboard.",
  },
  Manager: {
    label: "Quản lý cơ sở",
    description:
      "Quản lý vận hành tại từng cơ sở: giám sát tình trạng phòng, báo cáo doanh thu, xử lý ticket bảo trì, duyệt ngoại lệ giá, kiểm soát ca làm việc, báo cáo và bảo trì thiết bị.",
  },
  FrontDesk: {
    label: "Lễ tân",
    description:
      "Thực hiện nghiệp vụ front desk: đặt phòng, check-in/out, thu cọc, ghi charge F&B/minibar, đổi phòng, thao tác trên calendar, đối soát thu chi và gửi yêu cầu ngoại lệ.",
  },
  Kitchen: {
    label: "Bếp",
    description:
      "Nhận và xử lý ticket món ăn trong Kitchen Display System, cập nhật trạng thái chế biến.",
  },
  Waiter: {
    label: "Chạy bàn",
    description:
      "Quản lý danh sách bàn, tạo order, chỉnh sửa, void/discount, post charge vào phòng, thu tiền và đóng hóa đơn.",
  },
  Housekeeper: {
    label: "Buồng phòng",
    description: "Hoạt động quản lý buồng phòng và vệ sinh.",
  },
};

// Helper function nhận role và trả về thông tin tiếng Việt
export const getRoleInfo = (role?: string): RoleInfo => {
  if (!role) return { label: "Không xác định", description: "" };
  return roleMap[role] || { label: role, description: "" };
};

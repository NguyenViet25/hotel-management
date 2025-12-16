import React from "react";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { Option } from "../../../../../components/common/CustomSelect";
import CustomSelect from "../../../../../components/common/CustomSelect";

export interface RoleInfo {
  label: string;
  description: string;
}

const roleMap: Record<string, RoleInfo> = {
  // Admin: {
  //   label: "Quản trị hệ thống",
  //   description:
  //     "Quản trị hệ thống toàn chuỗi: tạo tài khoản, phân quyền, cấu hình giá, quản lý cơ sở, theo dõi audit, thiết lập báo cáo, cấu hình cổng thanh toán và dashboard.",
  // },
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

interface RoleSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  name?: string;
  enableHotelSelect?: boolean;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  name,
  enableHotelSelect = true,
}) => {
  const options: Option[] = Object.entries(roleMap).map(([key, info]) => ({
    value: key,
    label: info.label,
  }));

  if (enableHotelSelect === false) {
    options.splice(0, 1);
  }

  return (
    <CustomSelect
      name={name || "role"}
      value={value}
      onChange={onChange}
      label="Chọn vai trò"
      startIcon={<AssignmentIndIcon />}
      options={options}
      placeholder="Chọn vai trò cho người dùng"
    />
  );
};

export default RoleSelect;

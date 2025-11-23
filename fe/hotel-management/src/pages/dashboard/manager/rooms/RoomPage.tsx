import { useState } from "react";
import RoomMap from "./designer/RoomMap";
import ViewSwitcher from "./components/ViewSwitcher";
import PageTitle from "../../../../components/common/PageTitle";
import RoomManagementPage from "./designer/RoomManagementPage";
import HousekeepingAssignPage from "./designer/HousekeepingAssignPage";

export default function RoomPage() {
  const [view, setView] = useState<"map" | "table" | "assign">("map");

  return (
    <>
      <PageTitle
        title={
          view === "map"
            ? "Sơ Đồ Phòng"
            : view === "assign"
            ? "Phân công dọn dẹp"
            : "Quản lý phòng"
        }
        subtitle={
          view === "map"
            ? "Quản lý phòng theo dạng sơ đồ trực quan"
            : view === "assign"
            ? "Giao nhiệm vụ dọn buồng, cập nhật trạng thái"
            : "Xem danh sách phòng, thêm/sửa/xóa và cập nhật trạng thái"
        }
      />
      <ViewSwitcher view={view} onChange={setView} />
      {view === "map" && <RoomMap />}
      {view === "table" && <RoomManagementPage />}
      {view === "assign" && <HousekeepingAssignPage />}
    </>
  );
}

import { useState } from "react";
import RoomMap from "./designer/RoomMap";
import ViewSwitcher from "./components/ViewSwitcher";
import PageTitle from "../../../../components/common/PageTitle";
import RoomManagementPage from "./designer/RoomManagementPage";

export default function RoomPage() {
  const [view, setView] = useState<"map" | "table">("map");

  return (
    <>
      <PageTitle
        title="Quản lý phòng"
        subtitle="Xem danh sách phòng, thêm/sửa/xóa và cập nhật trạng thái"
      />
      <ViewSwitcher view={view} onChange={setView} />
      {view === "map" ? <RoomMap /> : <RoomManagementPage />}
    </>
  );
}

import React from "react";
import { Stack, Button } from "@mui/material";
import type { BookingSummaryDto } from "../../../../../api/bookingsApi";

export interface ActionsCellProps {
  summary: BookingSummaryDto;
  onEdit: (summary: BookingSummaryDto) => void;
  onCancel: (summary: BookingSummaryDto) => void;
  onCallLog: (summary: BookingSummaryDto) => void;
  onCheckIn: (summary: BookingSummaryDto) => void;
  onChangeRoom: (summary: BookingSummaryDto) => void;
  onExtendStay: (summary: BookingSummaryDto) => void;
  onCheckout: (summary: BookingSummaryDto) => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  summary,
  onEdit,
  onCancel,
  onCallLog,
  onCheckIn,
  onChangeRoom,
  onExtendStay,
  onCheckout,
}) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: "wrap" }}>
      <Button size="small" variant="text" onClick={() => onEdit(summary)}>
        Sửa
      </Button>
      <Button size="small" variant="text" color="error" onClick={() => onCancel(summary)}>
        Hủy
      </Button>
      <Button size="small" variant="text" color="warning" onClick={() => onCallLog(summary)}>
        Gọi xác nhận
      </Button>
      <Button size="small" variant="text" color="success" onClick={() => onCheckIn(summary)}>
        Nhận phòng
      </Button>
      <Button size="small" variant="text" onClick={() => onChangeRoom(summary)}>
        Đổi phòng
      </Button>
      <Button size="small" variant="text" onClick={() => onExtendStay(summary)}>
        Gia hạn
      </Button>
      <Button size="small" variant="text" color="primary" onClick={() => onCheckout(summary)}>
        Check-out
      </Button>
    </Stack>
  );
};

export default ActionsCell;
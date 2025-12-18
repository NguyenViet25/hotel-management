import React from "react";
import { Check } from "@mui/icons-material";
import ConfirmModal from "../../../../../components/common/ConfirmModel";
import type { BookingDetailsDto } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailsDto | null;
  onProceed?: () => void;
};

const CompleteBookingModal: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onProceed,
}) => {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Hoàn thành booking "
      message={
        <>
          Bạn có chắc chắn muốn hoàn thành yêu cầu đặt phòng này? Hành động này
          sẽ đánh dấu <strong>đã hoàn thành</strong>.
        </>
      }
      confirmIcon={<Check color="success" />}
      confirmColor="success"
      confirmText="Hoàn thành"
      onConfirm={async () => {
        if (!booking) return;
        onProceed?.();
      }}
    />
  );
};

export default CompleteBookingModal;

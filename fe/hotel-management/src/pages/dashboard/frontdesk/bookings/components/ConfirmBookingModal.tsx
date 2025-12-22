import React from "react";
import { Check } from "@mui/icons-material";
import bookingsApi, {
  type BookingDetailsDto,
} from "../../../../../api/bookingsApi";
import ConfirmModal from "../../../../../components/common/ConfirmModel";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailsDto | null;
  onSubmitted?: () => void;
};

const ConfirmBookingModal: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onSubmitted,
}) => {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Xác nhận booking"
      message={<>Bạn có chắc chắn muốn xác nhận yêu cầu đặt phòng này?</>}
      confirmIcon={<Check color="success" />}
      confirmColor="success"
      confirmText="Xác nhận"
      onConfirm={async () => {
        if (!booking) return;
        const res = await bookingsApi.confirm(booking.id);
        if (res.isSuccess) onSubmitted?.();
      }}
    />
  );
};

export default ConfirmBookingModal;

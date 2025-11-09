import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import React from "react";
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

const CancelBookingModal: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onSubmitted,
}) => {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Hủy booking & xử lý tiền cọc"
      message={
        <>
          Bạn có chắc chắn muốn hủy yêu cầu đặt phòng này? Hành động này sẽ{" "}
          <strong>xử lý tiền cọc</strong> nếu có.
        </>
      }
      icon={<ErrorOutlineIcon color="error" />}
      confirmColor="error"
      confirmText="Xác nhận hủy"
      onConfirm={async () => {
        if (!booking) return;
        const res = await bookingsApi.cancel(booking.id);
        if (res.isSuccess) onSubmitted?.();
      }}
    />
  );
};

export default CancelBookingModal;

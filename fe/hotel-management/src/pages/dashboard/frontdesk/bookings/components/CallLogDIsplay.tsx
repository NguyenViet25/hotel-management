import { CardContent, Stack, Typography, Chip, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { CallLogDto } from "../../../../../api/bookingsApi";
import { Warning } from "@mui/icons-material";

export default function CallLogsDisplay({ data }: { data: CallLogDto[] }) {
  return (
    <CardContent>
      {data?.length ? (
        <Stack spacing={1}>
          {data.map((c: CallLogDto) => {
            const isConfirmed = c.result === 1;
            const isCanceled = c.result === 2;
            return (
              <Stack
                key={c.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                }}
              >
                {/* Icon for result */}
                {isConfirmed ? (
                  <CheckCircleIcon color="success" />
                ) : isCanceled ? (
                  <CancelIcon color="error" />
                ) : (
                  <Warning color="warning" />
                )}

                <Stack spacing={0.25} flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(c.callTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kết quả:{" "}
                    {isConfirmed
                      ? "Đã xác nhận"
                      : isCanceled
                      ? "Hủy"
                      : "Chưa phản hồi"}{" "}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ghi chú: {c.notes ? `${c.notes}` : ""}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Chưa có dữ liệu nhật ký cuộc gọi
        </Typography>
      )}
    </CardContent>
  );
}

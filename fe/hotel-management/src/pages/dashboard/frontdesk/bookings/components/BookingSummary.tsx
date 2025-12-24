import { Stack, Typography, Paper, useTheme, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesIcon from "@mui/icons-material/Notes";
import PaymentsIcon from "@mui/icons-material/Payments";
import DiscountIcon from "@mui/icons-material/Discount";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import type { IBookingSummary } from "./types";
import Grid from "@mui/material/Grid";
import { Email, ResetTv } from "@mui/icons-material";

interface BookingSummaryProps {
  data: IBookingSummary;
  dateRange: {
    start: string;
    end: string;
    nights: number;
  };
  formatCurrency: (v?: number) => string;
}

export const BookingSummary = ({
  data,
  dateRange,
  formatCurrency,
}: BookingSummaryProps) => {
  if (!data) return null;
  const theme = useTheme();

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Left section - Guest info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                gutterBottom
              >
                Thông tin khách hàng
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {data.primaryGuestName || "—"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {data.phoneNumber || "—"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{data.email || "—"}</Typography>
              </Stack>
              {data.notes && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <NotesIcon fontSize="small" color="action" />
                  <Typography variant="body2">{data.notes}</Typography>
                </Stack>
              )}
              {/* <Stack
                sx={{ opacity: 0 }}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {data.phoneNumber || "—"}
                </Typography>
              </Stack> */}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Right section - Financial info */}
          <Paper
            elevation={2}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                gutterBottom
              >
                Thanh toán
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentsIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Tổng: {formatCurrency(data.totalAmount)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <DiscountIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Giảm giá: {formatCurrency(data.discountAmount)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <AccountBalanceWalletIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Tiền cọc: {formatCurrency(data.depositAmount)}
                </Typography>
              </Stack>

              {/* <Stack direction="row" spacing={1} alignItems="center">
                <ResetTv fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={theme.palette.success.main}
                >
                  Hoàn trả:{" "}
                  {formatCurrency(
                    Math.max(
                      0,
                      (data.depositAmount || 0) -
                        Math.max(
                          0,
                          (data.totalAmount || 0) - (data.discountAmount || 0)
                        )
                    )
                  )}
                </Typography>
              </Stack> */}

              <Stack direction="row" spacing={1} alignItems="center">
                <MonetizationOnIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={theme.palette.success.main}
                >
                  Còn lại: {formatCurrency(data.leftAmount)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

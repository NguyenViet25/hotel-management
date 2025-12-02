import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Stack,
  Chip,
  Grid,
  Divider,
  InputAdornment,
} from "@mui/material";
import ordersApi, {
  type OrderSummaryDto,
  type OrdersQueryParams,
  type OrderDetailsDto,
} from "../../../../../api/ordersApi";
import diningSessionsApi from "../../../../../api/diningSessionsApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import {
  Add,
  AddCircle,
  Assignment,
  Close,
  Person,
  Phone,
  Search,
} from "@mui/icons-material";

interface Props {
  open: boolean;
  sessionId: string;
  onClose: () => void;
  onAssigned: () => void;
  onAssignedWithDetails?: (order: OrderSummaryDto) => void;
}

export default function AssignOrderDialog({
  open,
  sessionId,
  onClose,
  onAssigned,
  onAssignedWithDetails,
}: Props) {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsMap, setItemsMap] = useState<
    Record<string, OrderDetailsDto["items"]>
  >({});

  useEffect(() => {
    if (!open) return;
    setResults([]);
    setSearch("");
    handleSearch("");
  }, [open]);

  const handleSearch = async (value: string) => {
    setLoading(true);
    const params: OrdersQueryParams = {
      hotelId: hotelId || undefined,
      search: value,
      page: 1,
      pageSize: 10,
    };
    const res = await ordersApi.listOrders(params);
    setLoading(false);
    setResults(res.data || []);
  };

  const handleAssign = async (orderId: string) => {
    await diningSessionsApi.assignOrder(sessionId, orderId);
    const found = results.find((o) => o.id === orderId);

    console.log("found", found);
    console.log("onAssignedWithDetails", onAssignedWithDetails);
    if (found && onAssignedWithDetails) onAssignedWithDetails(found);
    onAssigned();
    onClose();
  };

  useEffect(() => {
    const run = async () => {
      if (!results?.length) {
        setItemsMap({});
        return;
      }
      try {
        const calls = await Promise.all(
          results.map((o) => ordersApi.getById(o.id))
        );
        const map: Record<string, OrderDetailsDto["items"]> = {};
        results.forEach((o, idx) => {
          const d = calls[idx];
          if (d?.isSuccess) map[o.id] = d.data.items || [];
        });
        setItemsMap(map);
      } catch {}
    };
    run();
  }, [results]);

  const formatCurrency = (v: number) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v);
    } catch {
      return String(v);
    }
  };

  const statusLabel = (s: OrderSummaryDto["status"]) => {
    if (s === "2") return "Đã thanh toán";
    if (s === "3") return "Đã hủy";
    return "Đang xử lý";
  };

  const statusColor = (s: OrderSummaryDto["status"]) => {
    if (s === "2") return "success";
    if (s === "3") return "error";
    return "default";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gắn yêu cầu đặt món vào phiên phục vụ</DialogTitle>{" "}
      <DialogContent sx={{ minHeight: 500, maxHeight: 500, overflow: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 2, pt: 1 }}
        >
          <TextField
            label="Tìm kiếm"
            placeholder="Nhập tên hoặc số điện thoại"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment sx={{ mr: 1 }}>
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
            margin="dense"
          />
        </Stack>

        <Grid container spacing={2}>
          {results.map((o) => {
            const items = itemsMap[o.id] || [];
            const discount =
              ((o.itemsTotal || 0) * (o.promotionValue || 0)) / 100;
            const total = (o.itemsTotal || 0) - discount;
            return (
              <Grid key={o.id} size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader
                    title={
                      <Stack spacing={1} mb={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person />
                          <Typography fontWeight={700}>
                            Họ và tên: {o.customerName}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Phone />
                          <Typography fontWeight={700}>
                            SĐT: {o.customerPhone}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                    subheader={`Ngày đặt: ${new Date(
                      o.createdAt
                    ).toLocaleString()}`}
                    action={
                      <Chip
                        label={statusLabel(o.status)}
                        color={statusColor(o.status) as any}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Stack spacing={1.2}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          label={`Khách: ${o.guests ?? "—"}`}
                          size="small"
                        />
                        <Chip label={`Món: ${o.itemsCount}`} size="small" />
                        <Chip
                          label={`Tổng: ${formatCurrency(total)}`}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.75}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Danh sách món
                        </Typography>
                        {items.length === 0 ? (
                          <Typography color="text.secondary">
                            Không có món
                          </Typography>
                        ) : (
                          items.map((it) => (
                            <Stack
                              key={it.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography sx={{ flex: 1 }}>
                                {it.menuItemName}
                              </Typography>
                              <Chip label={`x${it.quantity}`} size="small" />
                              <Typography fontWeight={700}>
                                {formatCurrency(it.unitPrice * it.quantity)}
                              </Typography>
                            </Stack>
                          ))
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      startIcon={<Assignment />}
                      variant="contained"
                      onClick={() => handleAssign(o.id)}
                    >
                      Gắn vào phiên
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          {!loading && results.length === 0 && (
            <Grid>
              <Typography color="text.secondary">Không có kết quả</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" startIcon={<Close />} onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

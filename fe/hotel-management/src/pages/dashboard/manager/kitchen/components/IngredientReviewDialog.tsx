import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  QualityStatus,
  type ShoppingItemDto,
  type ShoppingListRequestDto,
  ShoppingOrderStatus,
} from "../../../../../api/kitchenApi";
import { getExactVNDate } from "../../../../../utils/date-helper";

export interface IngredientReviewDialogProps {
  open: boolean;
  hotelId: string;
  initialValues?: ShoppingListRequestDto;
  loading?: boolean;
  ingredients?: ShoppingItemDto[];
  onClose: () => void;
  onQualityChange?: (
    ingredient: ShoppingItemDto,
    quality: QualityStatus
  ) => void;
  onSubmit: (payload: ShoppingListRequestDto) => Promise<void> | void;
}

const qualityLabel = (q: QualityStatus) => {
  if (q === QualityStatus.Good) return "Tốt";
  if (q === QualityStatus.Acceptable) return "Chấp nhận";
  if (q === QualityStatus.Poor) return "Kém";
  if (q === QualityStatus.Expired) return "Hết hạn";
  return "Chưa đánh giá";
};

const qualityColor = (q: QualityStatus) => {
  if (q === QualityStatus.Good) return "success";
  if (q === QualityStatus.Acceptable) return "warning";
  if (q === QualityStatus.Poor) return "error";
  if (q === QualityStatus.Expired) return "error";
  return "info";
};

const IngredientReviewDialog: React.FC<IngredientReviewDialogProps> = ({
  open,
  loading,
  ingredients,
  onClose,
  onQualityChange,
  onSubmit,
  hotelId,
  initialValues,
}) => {
  const [items, setItems] = useState<ShoppingItemDto[]>([]);

  useEffect(() => {
    setItems(ingredients ?? []);
  }, [ingredients, open]);

  const handleQualityChange = (index: number, value: QualityStatus) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], qualityStatus: value };
      return next;
    });
    const current = items[index];
    if (current && onQualityChange) onQualityChange(current, value);
  };

  const handleSave = async () => {
    const payload: ShoppingListRequestDto = {
      id: initialValues?.id || undefined,
      orderDate: getExactVNDate(initialValues?.orderDate ?? ""),
      hotelId,
      notes: initialValues?.notes || "",
      shoppingItems: items || [],
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Xem và đánh giá nguyên liệu</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {(() => {
            const s = (initialValues as any)?.shoppingOrderStatus as
              | ShoppingOrderStatus
              | undefined;
            if (s === ShoppingOrderStatus.Confirmed)
              return <Chip label="Đã xác nhận" color="success" size="small" />;
            if (s === ShoppingOrderStatus.Cancelled)
              return <Chip label="Đã hủy" color="error" size="small" />;
            if (s === ShoppingOrderStatus.Draft)
              return <Chip label="Chờ xác nhận" size="small" />;
            return null;
          })()}
        </Stack>
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Không có nguyên liệu nào.
          </Typography>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell align="center">Chất lượng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it, idx) => (
                <TableRow key={it.id ?? idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>{it.unit}</TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      justifyContent={"center"}
                      spacing={1}
                      alignItems="center"
                    >
                      {[
                        QualityStatus.NotRated,
                        QualityStatus.Good,
                        QualityStatus.Acceptable,
                        QualityStatus.Poor,
                        QualityStatus.Expired,
                      ].map((q) => {
                        console.log("it", it);
                        return (
                          <Chip
                            key={q}
                            label={qualityLabel(q)}
                            color={
                              it.qualityStatus === q
                                ? qualityColor(it.qualityStatus)
                                : "default"
                            }
                            size="small"
                            onClick={() => handleQualityChange(idx, q)}
                          />
                        );
                      })}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: "100%", px: 2, pb: 2 }}
          justifyContent="flex-end"
        >
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientReviewDialog;

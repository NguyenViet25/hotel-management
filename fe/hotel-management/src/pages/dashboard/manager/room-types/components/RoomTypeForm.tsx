import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
  RoomType,
} from "../../../../../api/roomTypesApi";

const schema = z.object({
  hotelId: z.string().optional(),
  name: z.string().min(1, "Vui lòng nhập tên loại phòng"),
  description: z.string().optional(),
});

export interface RoomTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRoomTypeRequest | UpdateRoomTypeRequest) => Promise<void> | void;
  initialData?: RoomType | null;
  hotelId?: string; // required for create
}

type FormValues = z.infer<typeof schema>;

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  hotelId,
}) => {
  const isEdit = !!initialData;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotelId: hotelId ?? "",
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  const submitHandler = async (values: FormValues) => {
    if (isEdit) {
      const payload: UpdateRoomTypeRequest = {
        name: values.name,
        description: values.description ?? "",
      };
      await onSubmit(payload);
    } else {
      const payload: CreateRoomTypeRequest = {
        hotelId: values.hotelId || hotelId || "",
        name: values.name,
        description: values.description ?? "",
      };
      await onSubmit(payload);
    }
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Chỉnh sửa loại phòng" : "Thêm loại phòng"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!isEdit && !hotelId && (
            <TextField
              label="Hotel ID"
              fullWidth
              {...register("hotelId")}
              error={!!errors.hotelId}
              helperText={errors.hotelId?.message}
            />
          )}
          <TextField
            label="Tên loại phòng"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            minRows={3}
            {...register("description")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button onClick={handleSubmit(submitHandler)} variant="contained" disabled={isSubmitting}>
          {isEdit ? "Cập nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomTypeForm;
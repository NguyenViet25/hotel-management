import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  InputAdornment,
} from "@mui/material";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Group as GroupIcon,
  Fastfood as FastfoodIcon,
  MonetizationOn as MonetizationOnIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Close,
  Save,
} from "@mui/icons-material";
import type {
  MenuGroupDto,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from "../../../../../api/menusApi";

type FormValues = {
  menuGroupId: string;
  name: string;
  unitPrice: number;
  portionSize?: string;
  imageUrl?: string;
  status: string;
  isActive: boolean;
  description?: string;
};

const schema = z.object({
  menuGroupId: z.string().min(1, "Vui lòng chọn nhóm món"),
  name: z.string().min(1, "Tên món là bắt buộc").max(100, "Tối đa 100 ký tự"),
  unitPrice: z
    .number({ invalid_type_error: "Giá phải là số" })
    .min(0.01, "Giá phải lớn hơn 0")
    .max(10000000, "Giá quá lớn"),
  portionSize: z.string().optional(),
  imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  status: z.enum(["Available", "Unavailable", "SeasonallyUnavailable"]),
  isActive: z.boolean().default(true),
  description: z.string().max(500, "Tối đa 500 ký tự").optional(),
});

export interface MenuItemFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateMenuItemRequest | UpdateMenuItemRequest
  ) => Promise<void> | void;
  menuGroups: MenuGroupDto[];
  initialValues?: Partial<FormValues>;
  mode?: "create" | "edit";
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  menuGroups,
  initialValues,
  mode = "create",
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      menuGroupId: initialValues?.menuGroupId || "",
      name: initialValues?.name || "",
      unitPrice: initialValues?.unitPrice ?? 0,
      portionSize: initialValues?.portionSize || "",
      imageUrl: initialValues?.imageUrl || "",
      status: initialValues?.status || "Available",
      isActive: initialValues?.isActive ?? true,
      description: initialValues?.description || "",
    },
  });

  const submitHandler = async (values: FormValues) => {
    await onSubmit({
      menuGroupId: values.menuGroupId,
      name: values.name,
      unitPrice: values.unitPrice,
      portionSize: values.portionSize,
      imageUrl: values.imageUrl,
      status: values.status,
      isActive: values.isActive,
      description: values.description,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={600}>
        {mode === "create" ? "Thêm món mới" : "Chỉnh sửa món"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Menu Group */}
          <FormControl fullWidth>
            <InputLabel id="menuGroup-label">Nhóm món</InputLabel>
            <Controller
              control={control}
              name="menuGroupId"
              render={({ field }) => (
                <Select
                  labelId="menuGroup-label"
                  label="Nhóm món"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={!!errors.menuGroupId}
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  }
                >
                  {menuGroups.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name} ({g.shift})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                label="Tên món"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FastfoodIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Horizontal Stack: Unit Price & Portion Size */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              control={control}
              name="unitPrice"
              render={({ field }) => (
                <TextField
                  label="Đơn giá"
                  type="number"
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="portionSize"
              render={({ field }) => (
                <TextField
                  label="Khẩu phần"
                  placeholder="1 phần"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.portionSize}
                  helperText={errors.portionSize?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RestaurantMenuIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Stack>

          {/* Horizontal Stack: Status & IsActive */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    labelId="status-label"
                    label="Trạng thái"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.status}
                    startAdornment={
                      <InputAdornment position="start">
                        {field.value === "Available" ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <BlockIcon color="disabled" />
                        )}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Available">Đang bán</MenuItem>
                    <MenuItem value="Unavailable">Tạm ngừng</MenuItem>
                    <MenuItem value="SeasonallyUnavailable">Theo mùa</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Stack>

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                minRows={2}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.description}
                helperText={errors.description?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InfoIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Button
            startIcon={<Close />}
            variant="outlined"
            onClick={onClose}
            color="error"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit(submitHandler)}
            variant="contained"
            startIcon={<Save />}
            disabled={isSubmitting}
          >
            {mode === "create" ? "Tạo mới" : "Lưu"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemFormModal;

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
import React, { use, useEffect } from "react";
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
  MenuItemDto,
} from "../../../../../api/menusApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";

type FormValues = {
  category: string;
  name: string;
  unitPrice: number;
  imageUrl?: string;
  status: number;
  isActive: boolean;
  description?: string;
};

const schema = z.object({
  category: z.string().min(1, "Vui lòng chọn nhóm món"),
  name: z.string().min(1, "Tên món là bắt buộc").max(100, "Tối đa 100 ký tự"),
  unitPrice: z
    .number("Giá phải là số")
    .min(0.01, "Giá phải lớn hơn 0")
    .max(10000000, "Giá quá lớn"),
  imageUrl: z.string().optional().or(z.literal("")),
  status: z.number().int().min(0).max(1),
  description: z.string().max(500, "Tối đa 500 ký tự").optional(),
});

export interface MenuItemFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateMenuItemRequest | UpdateMenuItemRequest
  ) => Promise<void> | void;
  initialValues?: MenuItemDto;
  mode?: "create" | "edit";
  createType?: "food" | "set";
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  mode = "create",
  createType = "food",
}) => {
  const { user } = useStore<StoreState>((state) => state);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(
      createType === "set" && mode === "create"
        ? z.object({
            category: z.string().optional(),
            name: z.string().min(1, "Tên set là bắt buộc").max(100),
            unitPrice: z.number().optional(),
            imageUrl: z.string().optional().or(z.literal("")),
            status: z.number().int().min(0).max(1),
            isActive: z.boolean().optional(),
            description: z
              .string()
              .max(2000)
              .optional(),
          })
        : schema
    ),
    defaultValues: {
      category:
        createType === "set" && mode === "create"
          ? initialValues?.category ?? ""
          : initialValues?.category ?? "Món khai vị",
      name: initialValues?.name ?? "",
      unitPrice:
        createType === "set" && mode === "create"
          ? 1
          : initialValues?.unitPrice ?? 0,
      imageUrl: initialValues?.imageUrl ?? "",
      status: initialValues?.status ?? 0,
      isActive: initialValues?.isActive ?? true,
      description: initialValues?.description ?? "",
    },
  });

  console.log("errors", errors);
  useEffect(() => {
    if (mode === "edit") {
      setValue("category", initialValues?.category ?? "Món khai vị");
      setValue("name", initialValues?.name ?? "");
      setValue("unitPrice", initialValues?.unitPrice ?? 0);
      setValue("imageUrl", initialValues?.imageUrl ?? "");
      setValue("status", initialValues?.status ?? 0);
      setValue("isActive", initialValues?.isActive ?? true);
      setValue("description", initialValues?.description ?? "");
    }
  }, [initialValues]);

  const submitHandler = async (values: FormValues) => {
    if (createType === "set" && mode === "create") {
      const setName = (values.name || "").trim();
      const list = (values.description || "")
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (list.length === 0 && setName) {
        await onSubmit({
          hotelId: user?.hotelId,
          category: setName,
          name: setName,
          unitPrice: 1,
          imageUrl: values.imageUrl,
          status: values.status,
          isActive: values.isActive,
          description: "",
        });
      } else {
        for (const itemName of list) {
          await onSubmit({
            hotelId: user?.hotelId,
            category: setName,
            name: itemName,
            unitPrice: 1,
            imageUrl: values.imageUrl,
            status: values.status,
            isActive: values.isActive,
            description: "",
          });
        }
      }
    } else {
      await onSubmit({
        hotelId: user?.hotelId,
        category: values.category,
        name: values.name,
        unitPrice: values.unitPrice,
        imageUrl: values.imageUrl,
        status: values.status,
        isActive: values.isActive,
        description: values.description,
      });
    }

    reset();
  };

  const foodGroups = [
    { id: "Món khai vị", name: "Món khai vị" },
    { id: "Món chính", name: "Món chính" },
    { id: "Món lẩu", name: "Món lẩu" },
    { id: "Món nướng", name: "Món nướng" },
    { id: "Món tráng miệng", name: "Món tráng miệng" },
    { id: "Thức uống", name: "Thức uống" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={600}>
        {mode === "create"
          ? createType === "set"
            ? "Thêm set mới"
            : "Thêm món mới"
          : "Chỉnh sửa món"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Menu Group or Set Name */}
          {createType === "set" && mode === "create" ? (
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  label="Tên set (Nhóm món)"
                  fullWidth
                  value={field.value}
                  placeholder="Nhập tên set (ví dụ: BBQ Set)"
                  onChange={field.onChange}
                  error={!!errors.name}
                  helperText={(errors as any).name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel id="menuGroup-label">Nhóm món</InputLabel>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    labelId="menuGroup-label"
                    label="Nhóm món"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.category}
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupIcon />
                      </InputAdornment>
                    }
                  >
                    {foodGroups.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          {/* Name (food) - hidden in set create mode */}
          {!(createType === "set" && mode === "create") && (
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  label="Tên món"
                  fullWidth
                  value={field.value}
                  placeholder="Nhập tên món ăn"
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
          )}

          {/* Unit Price - hidden in set create mode */}
          {!(createType === "set" && mode === "create") && (
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
            </Stack>
          )}
          {/* Description or Set Items List */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                label={
                  createType === "set" && mode === "create"
                    ? "Danh sách món trong set"
                    : "Mô tả"
                }
                fullWidth
                multiline={createType === "set" && mode === "create"}
                minRows={createType === "set" && mode === "create" ? 3 : 1}
                value={field.value}
                placeholder={
                  createType === "set" && mode === "create"
                    ? "Mỗi dòng một món hoặc ngăn cách bằng dấu phẩy"
                    : "Nhập mô tả món ăn"
                }
                onChange={field.onChange}
                error={!!errors.description}
                helperText={errors.description?.message as any}
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
                        {field.value === 0 ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <BlockIcon color="disabled" />
                        )}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={0}>Đang bán</MenuItem>
                    <MenuItem value={1}>Ngừng bán</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
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

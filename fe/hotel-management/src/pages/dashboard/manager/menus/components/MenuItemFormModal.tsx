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
  Box,
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
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(
      z
        .object({
          category: z.string().optional(),
          name: z.string().min(1, "Tên là bắt buộc").max(100),
          unitPrice: z.number("Giá phải là số").optional(),
          imageUrl: z.string().optional().or(z.literal("")),
          status: z.number().int().min(0).max(1),
          isActive: z.boolean().optional(),
          description: z.string().max(2000, "Tối đa 2000 ký tự").optional(),
        })
        .superRefine((data, ctx) => {
          const isSet =
            (data.category || "").trim() === "Set" || createType === "set";
          if (!isSet) {
            if (!data.category || (data.category || "").trim().length === 0) {
              ctx.addIssue({
                path: ["category"],
                code: z.ZodIssueCode.custom,
                message: "Vui lòng chọn nhóm món",
              });
            }
            if (
              typeof data.unitPrice !== "number" ||
              Number.isNaN(data.unitPrice) ||
              data.unitPrice < 0.01
            ) {
              ctx.addIssue({
                path: ["unitPrice"],
                code: z.ZodIssueCode.custom,
                message: "Giá phải lớn hơn 0",
              });
            }
          }
        })
    ),
    defaultValues: {
      category:
        createType === "set"
          ? initialValues?.category ?? "Set"
          : initialValues?.category ?? "Món khai vị",
      name: initialValues?.name ?? "",
      unitPrice: createType === "set" ? 1 : initialValues?.unitPrice ?? 0,
      imageUrl: initialValues?.imageUrl ?? "",
      status: initialValues?.status ?? 0,
      isActive: initialValues?.isActive ?? true,
      description: initialValues?.description ?? "",
    },
  });

  console.log("errors", errors);

  const isSetMode = (watch("category") || "") === "Set" || createType === "set";
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue("imageUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  };
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
    console.log("values", values);
    const isSetSubmit =
      (values.category || "") === "Set" || createType === "set";
    if (isSetSubmit && mode === "create") {
      const setName = (values.name || "").trim();
      const list = (values.description || "")
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const joined = list.join(", ");
      await onSubmit({
        hotelId: user?.hotelId,
        category: "Set",
        name: setName,
        unitPrice: values.unitPrice,
        imageUrl: values.imageUrl,
        status: Number(values.status),
        isActive: values.status === 0,
        description: joined,
      });
    } else if (isSetSubmit && mode === "edit") {
      await onSubmit({
        hotelId: user?.hotelId,
        name: values.name,
        description: values.description,
        status: Number(values.status),
        isActive: values.status === 0,
        category: values.category,
        unitPrice: values.unitPrice,
      });
    } else {
      await onSubmit({
        hotelId: user?.hotelId,
        category: values.category,
        name: values.name,
        unitPrice: values.unitPrice,
        imageUrl: values.imageUrl,
        status: Number(values.status),
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
          ? isSetMode
            ? "Thêm set mới"
            : "Thêm món mới"
          : isSetMode
          ? "Chỉnh sửa set"
          : "Chỉnh sửa món"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Menu Group */}
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
                  <MenuItem value="Set">Set</MenuItem>
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
                label={isSetMode ? "Tên set (Nhóm món)" : "Tên món"}
                fullWidth
                value={field.value}
                placeholder={
                  isSetMode
                    ? "Nhập tên set (ví dụ: BBQ Set)"
                    : "Nhập tên món ăn"
                }
                onChange={field.onChange}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {isSetMode ? <GroupIcon /> : <FastfoodIcon />}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Unit Price - hidden in set create mode */}

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

          <Stack spacing={1}>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <TextField
                  label={
                    isSetMode
                      ? "Ảnh set (URL hoặc tải lên)"
                      : "Ảnh món (URL hoặc tải lên)"
                  }
                  fullWidth
                  value={field.value || ""}
                  placeholder="Dán URL ảnh hoặc dùng nút Tải ảnh"
                  onChange={field.onChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Tải ảnh
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleSelectImage}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            {watch("imageUrl") && (
              <Box
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #eee",
                }}
              >
                <img
                  src={watch("imageUrl")}
                  alt="preview"
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
              </Box>
            )}
          </Stack>
          {/* Description or Set Items List */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                label={isSetMode ? "Danh sách món trong set" : "Mô tả"}
                fullWidth
                multiline={isSetMode}
                minRows={isSetMode ? 3 : 1}
                value={field.value}
                placeholder={
                  isSetMode
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

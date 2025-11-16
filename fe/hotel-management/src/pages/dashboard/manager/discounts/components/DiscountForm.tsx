import { yupResolver } from "@hookform/resolvers/yup";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventIcon from "@mui/icons-material/Event";
import PercentIcon from "@mui/icons-material/Percent";
import RuleIcon from "@mui/icons-material/Rule";
import { Box, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import FormActionButtons from "../../../../../components/common/FormActionButtons";

export type DiscountFormValues = {
  code: string;
  name: string;
  description?: string | null;
  value: number;
  isActive: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

const schema = yup.object({
  code: yup.string().required("Mã là bắt buộc"),
  value: yup
    .number()
    .typeError("Giá trị phải là số")
    .positive("Giá trị phải > 0")
    .required("Giá trị là bắt buộc"),
  startDate: yup.date().required("Ngày bắt đầu là bắt buộc"),
  endDate: yup
    .date()
    .required("Ngày kết thúc là bắt buộc")
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  description: yup.string().nullable(),
  isActive: yup.boolean().required(),
});

export type DiscountFormProps = {
  initialValues?: Partial<DiscountFormValues>;
  onSubmit: (values: DiscountFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

const DiscountForm: React.FC<DiscountFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DiscountFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: initialValues?.code || "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      value: typeof initialValues?.value === "number" ? initialValues.value : 0,
      isActive:
        typeof initialValues?.isActive === "boolean"
          ? initialValues.isActive
          : true,
      startDate: initialValues?.startDate || dayjs(),
      endDate: initialValues?.endDate || dayjs().add(7, "day"),
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values as any);
  });

  return (
    <Stack spacing={2} pt={0.5}>
      <TextField
        label="Mã"
        fullWidth
        placeholder="Nhập mã giảm giá"
        {...register("code")}
        error={!!errors.code}
        helperText={errors.code?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <ConfirmationNumberIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Giá trị"
        type="number"
        fullWidth
        {...register("value")}
        error={!!errors.value}
        helperText={errors.value?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PercentIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <TextField select label="Trạng thái" {...field}>
            <MenuItem value={true}>Đang hoạt động</MenuItem>
            <MenuItem value={false}>Ngưng hoạt động</MenuItem>
          </TextField>
        )}
      />

      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Ngày bắt đầu"
            value={field.value}
            onChange={field.onChange}
            slotProps={{
              textField: {
                fullWidth: true,

                error: !!errors.startDate,
                helperText: errors.startDate?.message,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              },
            }}
          />
        )}
      />

      <Controller
        name="endDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Ngày hết hạn"
            value={field.value}
            onChange={field.onChange}
            slotProps={{
              textField: {
                fullWidth: true,

                error: !!errors.endDate,
                helperText: errors.endDate?.message,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              },
            }}
          />
        )}
      />

      <TextField
        label="Điều kiện"
        fullWidth
        multiline
        minRows={2}
        {...register("description")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <RuleIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ pt: 1 }}>
        <FormActionButtons
          onCancel={onCancel}
          submitLabel="Lưu"
          onSubmit={submit}
          isSubmitting={isSubmitting || submitting}
        />
      </Box>
    </Stack>
  );
};

export default DiscountForm;

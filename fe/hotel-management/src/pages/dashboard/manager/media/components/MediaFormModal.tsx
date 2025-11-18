import { zodResolver } from "@hookform/resolvers/zod";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditNoteIcon from "@mui/icons-material/EditNote";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { MediaDto, MediaUpdateRequest } from "../../../../../api/mediaApi";

type Mode = "create" | "edit";

const createSchema = z.object({
  file: z.instanceof(File).optional(),
});

const editSchema = z.object({
  fileName: z.string().min(1, "Tên tệp bắt buộc"),
  description: z.string().max(500).optional(),
});

interface MediaFormModalProps {
  open: boolean;
  mode?: Mode;
  initialValues?: MediaDto;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  onUpdate: (payload: MediaUpdateRequest) => Promise<void> | void;
}

const MediaFormModal: React.FC<MediaFormModalProps> = ({
  open,
  mode = "create",
  initialValues,
  onClose,
  onUpload,
  onUpdate,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(mode === "create" ? createSchema : editSchema),
    defaultValues:
      mode === "edit"
        ? {
            fileName: initialValues?.fileName ?? "",
            description: "",
          }
        : { file: undefined },
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({ fileName: initialValues.fileName, description: "" });
    }
  }, [mode, initialValues, reset]);

  const submitHandler = async (values: any) => {
    if (mode === "create") {
      const file: File | undefined = values.file;
      if (file) await onUpload(file);
    } else {
      const payload: MediaUpdateRequest = {
        fileName: values.fileName,
        description: values.description,
      };
      await onUpdate(payload);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {mode === "create" ? (
            <CloudUploadIcon />
          ) : (
            <EditNoteIcon />
          )}
          <Typography variant="h6" fontWeight={700}>
            {mode === "create" ? "Tải lên tệp" : "Chỉnh sửa thông tin tệp"}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {mode === "create" ? (
          <Stack gap={2} sx={{ mt: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setValue("file", f as any, { shouldValidate: true });
                if (f) {
                  setSelectedName(f.name);
                  setSelectedType(f.type);
                  setSelectedSize(f.size);
                  if (f.type.startsWith("image")) {
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                  } else {
                    setPreviewUrl(null);
                  }
                } else {
                  setPreviewUrl(null);
                  setSelectedName(null);
                  setSelectedType(null);
                  setSelectedSize(null);
                }
              }}
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Chọn tệp để tải lên
            </Button>
            {previewUrl && (
              <Stack direction="row" spacing={2} alignItems="center">
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
                />
                <Stack>
                  <Typography variant="body2">{selectedName}</Typography>
                  <Typography variant="caption">{selectedType}</Typography>
                  <Typography variant="caption">
                    {selectedSize ? Math.round(selectedSize / 1024) + " KB" : ""}
                  </Typography>
                </Stack>
              </Stack>
            )}
            {errors.file && (
              <Typography color="error" variant="caption">
                {(errors.file.message as string) ?? "File không hợp lệ"}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack gap={2} sx={{ mt: 1 }}>
            <Controller
              name="fileName"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Tên tệp"
                  size="small"
                  fullWidth
                  {...field}
                  error={!!errors.fileName}
                  helperText={(errors.fileName?.message as string) ?? ""}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Mô tả (tuỳ chọn)"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  {...field}
                  error={!!errors.description}
                  helperText={(errors.description?.message as string) ?? ""}
                />
              )}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={isSubmitting}
        >
          {mode === "create" ? "Tải lên" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaFormModal;
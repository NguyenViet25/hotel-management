import React from "react";
import { Button, Stack } from "@mui/material";

interface FormButtonsProps {
  /** Cancel button text */
  cancelLabel?: string;
  /** Cancel button click handler */
  onCancel: () => void;
  /** Optional icon for cancel button */
  cancelIcon?: React.ReactNode;

  /** Submit button text */
  submitLabel: string;
  /** Submit button click handler */
  onSubmit: () => void;
  /** Optional icon for submit button */
  submitIcon?: React.ReactNode;

  /** Submit button color */
  submitColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";

  /** Is submit in loading state */
  isSubmitting?: boolean;

  /** Optional variant for submit button */
  submitVariant?: "text" | "contained" | "outlined";

  /** Optional variant for cancel button */
  cancelVariant?: "text" | "contained" | "outlined";
}

const FormActionButtons: React.FC<FormButtonsProps> = ({
  cancelLabel = "Hủy",
  onCancel,
  cancelIcon,
  submitLabel,
  onSubmit,
  submitIcon,
  submitColor = "primary",
  isSubmitting = false,
  submitVariant = "contained",
  cancelVariant = "text",
}) => {
  return (
    <Stack direction="row" justifyContent="flex-end" spacing={1}>
      <Button onClick={onCancel} variant={cancelVariant} startIcon={cancelIcon}>
        {cancelLabel}
      </Button>
      <Button
        onClick={onSubmit}
        variant={submitVariant}
        color={submitColor}
        disabled={isSubmitting}
        startIcon={submitIcon}
      >
        {isSubmitting ? "Đang xử lý..." : submitLabel}
      </Button>
    </Stack>
  );
};

export default FormActionButtons;

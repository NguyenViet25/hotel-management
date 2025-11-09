import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import kitchenApi, {
  type IngredientQualityCheckDto,
  type IngredientQualityCheckResultDto,
  QualityStatus,
} from "../../../../../api/kitchenApi";

type Props = {
  open: boolean;
  initial?: IngredientQualityCheckDto | null;
  onClose: () => void;
  onSubmitted: (result: IngredientQualityCheckResultDto) => void;
};

// Modal form for ingredient quality check (UC-50)
export default function QualityCheckFormModal({
  open,
  initial,
  onClose,
  onSubmitted,
}: Props) {
  const { control, handleSubmit, watch, reset } =
    useForm<IngredientQualityCheckDto>({
      defaultValues: {
        ingredientName: "",
        status: QualityStatus.Good,
        notes: "",
        needsReplacement: false,
        replacementQuantity: undefined,
        replacementUnit: "",
      },
    });

  // When editing, prefill form
  useEffect(() => {
    if (initial) {
      reset(initial);
    } else {
      reset({
        ingredientName: "",
        status: QualityStatus.Good,
        notes: "",
        needsReplacement: false,
        replacementQuantity: undefined,
        replacementUnit: "",
      });
    }
  }, [initial, reset]);

  const needsReplacement = watch("needsReplacement");

  const onSubmit = async (dto: IngredientQualityCheckDto) => {
    // Submit to API and return created check result (note: not persisted server-side per docs)
    const res = await kitchenApi.checkIngredientQuality(dto);
    if (res.isSuccess) {
      onSubmitted(res.data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial ? "Edit Quality Check" : "Add Quality Check"}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)} id="quality-check-form">
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller
                name="ingredientName"
                control={control}
                rules={{ required: "Ingredient name is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Ingredient Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Quality Status">
                    <MenuItem value={QualityStatus.Good}>Good</MenuItem>
                    <MenuItem value={QualityStatus.Acceptable}>
                      Acceptable
                    </MenuItem>
                    <MenuItem value={QualityStatus.Poor}>Poor</MenuItem>
                    <MenuItem value={QualityStatus.Expired}>Expired</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="needsReplacement"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(_, v) => field.onChange(v)}
                      />
                    }
                    label="Needs replacement"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    fullWidth
                    multiline
                    minRows={2}
                  />
                )}
              />
            </Grid>
            {needsReplacement && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="replacementQuantity"
                    control={control}
                    rules={{
                      min: { value: 0, message: "Quantity must be >= 0" },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Replacement Quantity"
                        fullWidth
                        inputProps={{ step: "0.1" }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="replacementUnit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Replacement Unit"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="quality-check-form" variant="contained">
          {initial ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

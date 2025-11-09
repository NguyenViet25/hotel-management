import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import kitchenApi, {
  type IngredientQualityCheckDto,
  type IngredientQualityCheckResultDto,
  type ShoppingListDto,
  type ShoppingListRequestDto,
} from "../../../../api/kitchenApi";
import ShoppingListFilters from "./components/ShoppingListFilters";
import ShoppingListTable from "./components/ShoppingListTable";
import QualityCheckFormModal from "./components/QualityCheckFormModal";
import QualityChecksTable from "./components/QualityChecksTable";
import PageTitle from "../../../../components/common/PageTitle";

export default function KitchenManagementPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingListDto | null>(
    null
  );
  const [listLoading, setListLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] =
    useState<IngredientQualityCheckDto | null>(null);
  const [checks, setChecks] = useState<IngredientQualityCheckResultDto[]>([]);

  // Generate shopping list (UC-49)
  const handleGenerate = useCallback(
    async (payload: ShoppingListRequestDto) => {
      setListLoading(true);
      try {
        const res = await kitchenApi.generateShoppingList(payload);
        if (res.isSuccess) {
          setShoppingList(res.data);
        }
      } finally {
        setListLoading(false);
      }
    },
    []
  );

  // Open quality check modal
  const openAddCheck = () => {
    setEditingCheck(null);
    setModalOpen(true);
  };

  const openEditCheck = (row: IngredientQualityCheckResultDto) => {
    // Map result to DTO for editing; server returns checkedBy/date which are not part of DTO
    const dto: IngredientQualityCheckDto = {
      ingredientName: row.ingredientName,
      status: row.status,
      notes: row.notes,
      needsReplacement: row.needsReplacement,
      replacementQuantity: row.replacementQuantity,
      replacementUnit: row.replacementUnit,
    };
    setEditingCheck(dto);
    setModalOpen(true);
  };

  const handleSubmitted = (result: IngredientQualityCheckResultDto) => {
    // If editing, replace entry by id; otherwise append
    setChecks((prev) => {
      const idx = prev.findIndex((x) => x.id === result.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = result;
        return next;
      }
      return [result, ...prev];
    });
  };

  const handleDeleteCheck = (row: IngredientQualityCheckResultDto) => {
    // Client-side delete since server does not persist per current UC-50 docs
    setChecks((prev) => prev.filter((x) => x.id !== row.id));
  };

  return (
    <Box>
      <PageTitle
        title="Kitchen Management"
        subtitle="Shopping list & quality check"
      />
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Generate Shopping List
            </Typography>
            {/* Filters build request payload for UC-49 */}
            <ShoppingListFilters
              onGenerate={handleGenerate}
              loading={listLoading}
            />
            <Divider sx={{ my: 2 }} />
            <ShoppingListTable
              items={shoppingList?.items ?? []}
              loading={listLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">Ingredient Quality Checks</Typography>
              <Button variant="contained" onClick={openAddCheck}>
                Add Check
              </Button>
            </Stack>
            {/* Client-side list of recent checks returned by UC-50 */}
            <QualityChecksTable
              data={checks}
              onEdit={openEditCheck}
              onDelete={handleDeleteCheck}
            />
          </CardContent>
        </Card>
      </Stack>

      {/* Add/Edit modal */}
      <QualityCheckFormModal
        open={modalOpen}
        initial={editingCheck}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </Box>
  );
}

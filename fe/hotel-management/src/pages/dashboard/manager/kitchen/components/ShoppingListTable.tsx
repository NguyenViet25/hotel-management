import { Box, Chip } from "@mui/material";
import type { ShoppingListItemDto } from "../../../../../api/kitchenApi";
import DataTable from "../../../../../components/common/DataTable";

type Props = {
  items: ShoppingListItemDto[];
  loading?: boolean;
};

// Table displaying aggregated shopping list items (UC-49)
export default function ShoppingListTable({ items, loading }: Props) {
  const columns = [
    {
      header: "Ingredient",
      accessorKey: "ingredientName",
    },
    {
      header: "Total Quantity",
      accessorKey: "totalQuantity",
      cell: ({ row }: any) => {
        const q = row.original.totalQuantity as number;
        const u = row.original.unit as string;
        return `${q} ${u}`;
      },
    },
    {
      header: "Related Menu Items",
      accessorKey: "relatedMenuItems",
      cell: ({ row }: any) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {(row.original.relatedMenuItems as string[]).map((name) => (
            <Chip key={name} label={name} size="small" />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={!!loading}
      emptyMessage="No items to show"
    />
  );
}

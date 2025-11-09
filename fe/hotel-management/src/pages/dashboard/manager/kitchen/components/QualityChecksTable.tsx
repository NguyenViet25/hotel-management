import { Box, Chip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  type IngredientQualityCheckResultDto,
  QualityStatus,
} from "../../../../../api/kitchenApi";
import DataTable from "../../../../../components/common/DataTable";

type Props = {
  data: IngredientQualityCheckResultDto[];
  onEdit: (row: IngredientQualityCheckResultDto) => void;
  onDelete: (row: IngredientQualityCheckResultDto) => void;
};

// Table to show locally recorded quality checks (client-side list for now)
export default function QualityChecksTable({ data, onEdit, onDelete }: Props) {
  const statusLabel = (s: QualityStatus) => {
    switch (s) {
      case QualityStatus.Good:
        return "Good";
      case QualityStatus.Acceptable:
        return "Acceptable";
      case QualityStatus.Poor:
        return "Poor";
      case QualityStatus.Expired:
        return "Expired";
      default:
        return String(s);
    }
  };

  const columns = [
    { header: "Ingredient", accessorKey: "ingredientName" },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => (
        <Chip
          label={statusLabel(row.original.status as QualityStatus)}
          color={
            row.original.status >= QualityStatus.Poor ? "warning" : "success"
          }
          size="small"
        />
      ),
    },
    { header: "Notes", accessorKey: "notes" },
    {
      header: "Replacement",
      accessorKey: "needsReplacement",
      cell: ({ row }: any) => {
        const r = row.original;
        return r.needsReplacement
          ? `${r.replacementQuantity ?? ""} ${r.replacementUnit ?? ""}`.trim()
          : "-";
      },
    },
    { header: "Checked By", accessorKey: "checkedByUserName" },
    { header: "Checked Date", accessorKey: "checkedDate" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: any) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(row.original)}
            aria-label="edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(row.original)}
            aria-label="delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No quality checks yet"
    />
  );
}

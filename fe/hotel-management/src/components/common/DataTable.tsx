import { RestartAlt } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import React, { useState } from "react";

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onLock?: (record: T) => void;
  onResetPassword?: (record: T) => void;
  onView?: (record: T) => void;
  actionColumn?: boolean;
  getRowId: (row: T) => string | number;
  onSort?: (property: string) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSearch?: (searchText: string) => void;
  borderRadius?: number;
  renderActions?: (row: T) => React.ReactNode;
  disableEdit?: (row: T) => boolean;
}

const DataTable = <T extends object>({
  columns,
  data,
  loading = false,
  pagination,
  onAdd,
  onEdit,
  onDelete,
  onLock,
  onResetPassword,
  onView,
  actionColumn = true,
  getRowId,
  onSort,
  sortBy,
  onSearch,
  sortDirection = "asc",
  borderRadius = 2,
  renderActions,
  disableEdit = (row: T) => false,
}: DataTableProps<T>) => {
  const handleSort = (property: string) => {
    if (onSort) {
      onSort(property);
    }
  };

  const [searchText, setSearchText] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) {
      onSearch?.(value);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: borderRadius > 0 ? borderRadius : 0,
      }}
    >
      <Stack
        sx={{
          p: onSearch || onAdd ? 2 : 0,
          display: "flex",
          justifyContent: "space-between",
          borderBottom:
            onSearch || onAdd ? "1px solid rgba(224, 224, 224, 1)" : "none",
        }}
        gap={1}
        direction={{ xs: "column", lg: "row" }}
      >
        {onSearch && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              placeholder="Tìm kiếm..."
              size="small"
              value={searchText}
              onChange={handleSearch}
              sx={{ width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
        {onAdd && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Thêm mới
          </Button>
        )}
      </Stack>

      <TableContainer sx={{ maxHeight: 410 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  style={{
                    minWidth: column.minWidth || 100,
                    fontWeight: "bold",
                  }}
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actionColumn &&
                (onView || onEdit || onDelete || onLock || onResetPassword) && (
                  <TableCell
                    align="center"
                    style={{ minWidth: 150, fontWeight: "bold" }}
                  >
                    Hành động
                  </TableCell>
                )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actionColumn ? 1 : 0)}
                  align="center"
                >
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actionColumn ? 1 : 0)}
                  align="center"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={getRowId(row)}
                  >
                    {columns.map((column) => {
                      const value = row[column.id as keyof T];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.render
                            ? column.render(row)
                            : column.format
                            ? column.format(value)
                            : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                    {actionColumn &&
                      (onView ||
                        onEdit ||
                        onDelete ||
                        onLock ||
                        onResetPassword) && (
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            {onView && (
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onView(row)}
                                aria-label="view"
                              >
                                <RemoveRedEye fontSize="small" />
                              </IconButton>
                            )}
                            {onEdit && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(row)}
                                aria-label="edit"
                                disabled={disableEdit(row)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {onDelete && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row)}
                                aria-label="delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                            {onLock && (
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => onLock(row)}
                                aria-label="lock"
                              >
                                <RestartAlt fontSize="small" />
                              </IconButton>
                            )}
                            {onResetPassword && (
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onResetPassword(row)}
                                aria-label="reset password"
                              >
                                <KeyIcon fontSize="small" />
                              </IconButton>
                            )}
                            {renderActions && renderActions(row)}
                          </Stack>
                        </TableCell>
                      )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.pageSize)}
            page={pagination.page}
            onChange={(_, page) => pagination.onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;

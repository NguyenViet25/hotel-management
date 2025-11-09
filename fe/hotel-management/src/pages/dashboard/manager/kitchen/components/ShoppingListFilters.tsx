import { useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Autocomplete, Button } from "@mui/material";
import menusApi, { type MenuItemDto } from "../../../../../api/menusApi";
import type { ShoppingListRequestDto } from "../../../../../api/kitchenApi";

type Props = {
  onGenerate: (payload: ShoppingListRequestDto) => void;
  loading?: boolean;
};

// Filters for generating shopping list (UC-49)
export default function ShoppingListFilters({ onGenerate, loading }: Props) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuItemDto[]>([]);

  // Fetch menu items for optional narrowing by item IDs
  useEffect(() => {
    let mounted = true;
    menusApi
      .getMenuItems({ page: 1, pageSize: 100 })
      .then((res) => {
        if (mounted && res.isSuccess) {
          setMenuItems(res.data);
        }
      })
      .catch(() => {
        // silent fail; user can still generate without selecting items
      });
    return () => {
      mounted = false;
    };
  }, []);

  const menuItemOptions = useMemo(() => menuItems, [menuItems]);

  const handleGenerate = () => {
    const payload: ShoppingListRequestDto = {
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      menuItemIds:
        selectedMenuItems.length > 0
          ? selectedMenuItems.map((mi) => mi.id)
          : undefined,
    };
    onGenerate(payload);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            label="Start date"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="End date"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Autocomplete
            multiple
            options={menuItemOptions}
            getOptionLabel={(o) => o.name}
            value={selectedMenuItems}
            onChange={(_, v) => setSelectedMenuItems(v)}
            renderInput={(params) => (
              <TextField {...params} label="Menu items (optional)" />
            )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            Generate
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

import React from "react";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import GuestCard from "./GuestCard";
import { Add, AddCircle } from "@mui/icons-material";

export type GuestItem = {
  id?: string;
  fullname?: string;
  name?: string;
  phone?: string;
  email?: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  typeLabel?: string;
};

type Props = {
  title: string;
  guests: GuestItem[];
  editable?: boolean;
  onEdit?: (idx: number, guest: GuestItem) => void;
  onDelete?: (idx: number, guest: GuestItem) => void;
  onAddGuestClick?: () => void;
};

const GuestList: React.FC<Props> = ({
  title,
  guests,
  editable = true,
  onEdit,
  onDelete,
  onAddGuestClick,
}) => {
  return (
    <Stack spacing={0.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <Button
          onClick={onAddGuestClick}
          variant="outlined"
          startIcon={<AddCircle />}
          size="small"
        >
          Thêm khách
        </Button>
      </Stack>
      {!guests?.length ? (
        <Typography variant="body2" color="text.secondary">
          Chưa có danh sách khách
        </Typography>
      ) : (
        <Grid container spacing={1.5} mt={1}>
          {guests.map((g, idx) => (
            <Grid
              size={12}
              key={g.id || `${g.fullname || g.name}-${g.phone}-${idx}`}
            >
              <GuestCard
                name={g.fullname ?? g.name}
                phone={g.phone}
                email={g.email}
                onEdit={onEdit ? () => onEdit(idx, g) : undefined}
                onDelete={onDelete ? () => onDelete(idx, g) : undefined}
                disabledEdit={!editable}
                disabledDelete={!editable}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

export default GuestList;

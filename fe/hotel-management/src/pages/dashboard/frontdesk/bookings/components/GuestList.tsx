import { AddCircle } from "@mui/icons-material";
import { Button, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import GuestCard from "./GuestCard";
import type { BookingGuestDto } from "../../../../../api/bookingsApi";

type Props = {
  title: string;
  guests: BookingGuestDto[];
  isDisabled?: boolean;
  editable?: boolean;
  onEdit?: (idx: number, guest: BookingGuestDto) => void;
  onDelete?: (idx: number, guest: BookingGuestDto) => void;
  onAddGuestClick?: () => void;
  onChangeRoom?: (guest: BookingGuestDto) => void;
  onExtendStay?: () => void;
};

const GuestList: React.FC<Props> = ({
  title,
  guests,
  editable = true,
  onEdit,
  onDelete,
  onAddGuestClick,
  onChangeRoom,
  onExtendStay,
  isDisabled = false,
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
          disabled={!editable || isDisabled}
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
              key={g.guestId || `${g.fullname || g.fullname}-${g.phone}-${idx}`}
            >
              <GuestCard
                guest={g}
                onEdit={onEdit ? () => onEdit(idx, g) : undefined}
                onDelete={onDelete ? () => onDelete(idx, g) : undefined}
                disabledEdit={!editable}
                disabledDelete={!editable}
                disabledChangeRoom={!editable}
                onChangeRoom={onChangeRoom ? () => onChangeRoom(g) : undefined}
                onExtendStay={onExtendStay}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

export default GuestList;

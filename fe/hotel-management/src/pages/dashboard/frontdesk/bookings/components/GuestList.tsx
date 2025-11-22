import React from "react";
import { Grid, Stack, Typography } from "@mui/material";
import GuestCard from "./GuestCard";

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
};

const GuestList: React.FC<Props> = ({
  title,
  guests,
  editable = true,
  onEdit,
  onDelete,
}) => {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" fontWeight={700}>
        {title}
      </Typography>
      {!guests?.length ? (
        <Typography variant="body2" color="text.secondary">
          Chưa có danh sách khách
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
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

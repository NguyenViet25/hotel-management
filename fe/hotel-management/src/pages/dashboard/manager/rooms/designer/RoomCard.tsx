import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { ROOM_TYPE_META, type Room } from "./types";
import { Draggable } from "@hello-pangea/dnd";

interface Props {
  room: Room;
  index: number;
}

const RoomCard: React.FC<Props> = ({ room, index }) => {
  const meta = ROOM_TYPE_META[room.type];
  return (
    <Draggable draggableId={`room-${room.id}`} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            width: 180,
            borderRadius: 2,
            boxShadow: snapshot.isDragging ? 6 : 2,
            transition: "box-shadow 150ms ease",
            cursor: "grab",
            bgcolor: snapshot.isDragging ? "background.paper" : "background.default",
            '&:hover': { boxShadow: 6 },
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={meta.label}
                  icon={meta.icon as any}
                  size="small"
                  sx={{ bgcolor: meta.color, color: "white" }}
                />
                <Typography variant="subtitle2" fontWeight={700}>
                  #{room.number}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {room.status}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default RoomCard;
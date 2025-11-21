import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Grid,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Droppable } from "@hello-pangea/dnd";
import RoomCard from "./RoomCard";
import AddRoomDialog from "./AddRoomDialog";
import { useDesignerStore } from "./store";
import type { Floor } from "./types";

interface Props {
  floor: Floor;
  index: number;
}

const FloorCard: React.FC<Props> = ({ floor }) => {
  const removeFloor = useDesignerStore((s) => s.removeFloor);
  const [openAddRoom, setOpenAddRoom] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        mb: 2,
        "&:hover": { boxShadow: 6 },
        backgroundImage: "none",
      }}
    >
      <CardHeader
        title={floor.title}
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Add Room">
              <IconButton
                aria-label="add-room"
                onClick={() => setOpenAddRoom(true)}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove Floor">
              <IconButton
                aria-label="remove-floor"
                onClick={() => removeFloor(floor.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent>
        <Droppable
          droppableId={`floor-${floor.id}`}
          direction="horizontal"
          type="ROOM"
        >
          {(provided) => (
            <Grid
              container
              spacing={2}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {floor.rooms.map((room, i) => (
                <Grid item key={room.id}>
                  <RoomCard room={room} index={i} />
                </Grid>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </CardContent>

      <AddRoomDialog
        open={openAddRoom}
        onClose={() => setOpenAddRoom(false)}
        floorId={floor.id}
      />
    </Card>
  );
};

export default FloorCard;
